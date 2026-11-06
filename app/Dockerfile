# Imagem oficial do Node.js
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar configurações do projeto
COPY package*.json ./

# Instalar dependências
RUN npm install --omit=dev

# Copiar os arquivos da aplicação
COPY . .

# Porta utilizada pelo servidor
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
