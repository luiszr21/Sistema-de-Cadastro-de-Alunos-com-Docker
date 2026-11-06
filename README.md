# Sistema de Cadastro de Alunos com Docker

Atividade prática de **Computação em Nuvem**

## O que é o projeto

Sistema web para **cadastrar, listar e excluir alunos**, executado em três containers Docker conectados por uma rede Bridge personalizada, com os dados do banco guardados em um volume persistente.

| Componente | Nome | Descrição |
|---|---|---|
| Container 1 | `app-alunos` | Aplicação web em Node.js (Express), imagem `cadastro-alunos:v1` construída com Dockerfile. Porta 3000 |
| Container 2 | `postgres-alunos` | Banco de dados PostgreSQL 17 que armazena os registros. Porta 5432 (interna) |
| Container 3 | `adminer-alunos` | Interface web para administrar e consultar o banco. Porta 8080 |
| Rede | `rede-faculdade` | Rede Bridge personalizada compartilhada pelos três containers |
| Volume | `dados-alunos` | Garante a persistência dos dados do PostgreSQL |

Acessos:
- Aplicação: http://localhost:3000
- Adminer: http://localhost:8080 (Sistema: PostgreSQL, Servidor: `postgres-alunos`, Usuário: `professor`, Senha: `queridoprofessor`, Base: `faculdade`)

## Como executar os testes

Os testes pressupõem que os três containers estão em execução.

> No Git Bash (Windows), rode `export MSYS_NO_PATHCONV=1` uma vez por terminal.

### Teste 1: Execução dos três containers

```bash
docker ps
```

**Esperado:** os containers Node.js, PostgreSQL e Adminer com status `Up`.

### Teste 2: Comunicação entre containers

```bash
docker exec app-alunos node -e "require('dns').lookup('postgres-alunos', console.log)"
```

**Esperado:** o Node.js resolve o nome `postgres-alunos` para um endereço IP.

Para confirmar a comunicação real com o banco, consulte a API:

```bash
curl http://localhost:3000/alunos
```

### Teste 3: Cadastro e consulta dos alunos

1. Acesse http://localhost:3000
2. Cadastre três alunos
3. Verifique que os registros aparecem na interface web

**Esperado:** os três alunos são apresentados corretamente.

### Teste 4: Consulta direta ao PostgreSQL

1. Acesse http://localhost:8080 pelo Adminer
2. Execute:

```sql
SELECT * FROM alunos;
```

**Esperado:** os mesmos três alunos cadastrados na aplicação estão armazenados no PostgreSQL.

### Teste 5: Persistência dos dados

Remover o container PostgreSQL, recriá-lo utilizando o mesmo volume e demonstrar que os registros não foram perdidos.

1. Parar e remover o banco:

```bash
docker stop postgres-alunos
docker rm postgres-alunos
```

2. Verificar que o volume continua existindo:

```bash
docker volume ls
```

3. Recriar o PostgreSQL utilizando o mesmo volume:

```bash
docker run -d \
  --name postgres-alunos \
  --network rede-faculdade \
  -e POSTGRES_USER=professor \
  -e POSTGRES_PASSWORD=queridoprofessor \
  -e POSTGRES_DB=faculdade \
  -v dados-alunos:/var/lib/postgresql/data \
  postgres:17
```

4. Confirmar a disponibilidade do PostgreSQL (se ainda não estiver pronto, repetir o comando após a inicialização):

```bash
docker exec postgres-alunos \
  pg_isready -U professor -d faculdade
```

5. Verificar os registros:

```bash
docker exec postgres-alunos \
  psql -U professor -d faculdade \
  -c "SELECT * FROM alunos;"
```

**Esperado:** os três alunos permanecem cadastrados, porque os registros foram armazenados no volume Docker, que não foi removido.
