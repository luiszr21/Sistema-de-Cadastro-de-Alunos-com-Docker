const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = 3000;

// Configurações de conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432
});

// Permitir receber JSON
app.use(express.json());

// Arquivos da interface web
app.use(express.static(path.join(__dirname, "public")));

// Listar alunos
app.get("/alunos", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM alunos ORDER BY id"
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao consultar alunos"
    });
  }
});

// Cadastrar aluno
app.post("/alunos", async (req, res) => {
  const { nome, matricula, curso } = req.body;

  if (
    typeof nome !== "string" ||
    typeof matricula !== "string" ||
    typeof curso !== "string" ||
    !nome.trim() ||
    !matricula.trim() ||
    !curso.trim()
  ) {
    return res.status(400).json({
      erro: "Preencha todos os campos"
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO alunos (nome, matricula, curso)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome.trim(), matricula.trim(), curso.trim()]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "Matrícula já cadastrada"
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar aluno"
    });
  }
});

// Excluir aluno
app.delete("/alunos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID inválido"
    });
  }

  try {
    const resultado = await pool.query(
      "DELETE FROM alunos WHERE id = $1 RETURNING id",
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: "Aluno não encontrado"
      });
    }

    res.json({ mensagem: "Aluno excluído" });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao excluir aluno"
    });
  }
});

// Criar a tabela e iniciar o servidor
async function iniciar() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alunos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        matricula VARCHAR(30) UNIQUE NOT NULL,
        curso VARCHAR(100) NOT NULL
      )
    `);

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Servidor iniciado na porta " + PORT);
    });
  } catch (erro) {
    console.error("Erro ao iniciar:", erro.message);
    process.exit(1);
  }
}

iniciar();
