import mongoose from 'mongoose';

// Opção 1: Usando top-level await (como você está fazendo)
try {
  await mongoose.connect('mongodb://localhost:27017/MedAppDataBase');
  console.log('Conexão inicial com MongoDB estabelecida');
} catch (error) {
  console.error('Erro ao conectar com MongoDB:', error);
  // Em ambiente de produção, você pode querer encerrar o processo aqui
  // process.exit(1);
}

const db = mongoose.connection;

// Tratamento de eventos de conexão
db.on('error', (error) => {
  console.error('Erro na conexão MongoDB:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB desconectado');
});

db.once('open', () => {
  console.log('Conexão com o banco de dados estabelecida com sucesso');
});

export default db;