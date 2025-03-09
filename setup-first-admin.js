import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import db from './database/database.js';

async function setFirstDoctorAsAdmin() {
  try {
    console.log("Conectando ao banco de dados...");
    
    // Encontrar o primeiro médico (por data de criação)
    const firstDoctor = await Doctor.findOne().sort({ createdAt: 1 });
    
    if (firstDoctor) {
      console.log("Primeiro médico encontrado:", firstDoctor.name, "CRM:", firstDoctor.crm);
      
      // Definir como admin
      firstDoctor.isAdmin = true;
      await firstDoctor.save();
      
      console.log("Primeiro médico definido como admin com sucesso!");
    } else {
      console.log("Nenhum médico encontrado no banco de dados");
    }
    
    // Fechar a conexão
    console.log("Fechando conexão com o banco de dados...");
    await mongoose.connection.close();
    console.log("Conexão fechada");
    
  } catch (error) {
    console.error("Erro ao definir primeiro médico como admin:", error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
setFirstDoctorAsAdmin();