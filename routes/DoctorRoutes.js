import express from "express";
import DoctorController from "../controllers/DoctorController.js";
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// Rota específica para configurar o primeiro administrador (acesso único)
router.post("/doctors/setup-admin", async (req, res) => {
  try {
    // Verificar se já existe algum médico cadastrado
    const doctorCount = await Doctor.countDocuments();
    
    // Se não houver médicos, este será o primeiro e portanto um admin
    const isFirstDoctor = doctorCount === 0;
    
    // Se já existir algum admin e não for o primeiro médico, bloquear
    if (!isFirstDoctor) {
      const adminExists = await Doctor.findOne({ isAdmin: true });
      if (adminExists) {
        return res.status(400).json({ 
          error: 'Um administrador já foi configurado. Use a rota normal com autenticação.' 
        });
      }
    }
    
    // Modificar o req.body para incluir isAdmin=true
    req.body.isAdmin = true;
    
    // Chamar o controller para criar o médico
    return DoctorController.create(req, res);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Rotas públicas (não precisam de autenticação)
router.get("/doctors", DoctorController.listAll);
router.post("/doctors/login-admin", DoctorController.loginAdmin);  // Rota de login para admin
router.post("/doctors/login-doctor", DoctorController.loginDoctor); // Rota de login para médicos
router.post("/doctors/authenticate", DoctorController.authenticate);

// Rotas específicas precisam vir ANTES das rotas com parâmetros como :id
router.get("/doctors/me", verifyToken, DoctorController.getMe);
router.get("/doctors/specialty/:specialty", DoctorController.findBySpecialty);
router.get("/doctors/available/:date", DoctorController.findAvailableByDate);

// Rotas que exigem privilégios de administrador
router.post("/doctors", verifyAdmin, DoctorController.create);
router.put("/doctors/:id", verifyAdmin, DoctorController.update);
router.delete("/doctors/:id", verifyAdmin, DoctorController.delete);

// Rotas com parâmetros dinâmicos para todos os usuários autenticados
router.get("/doctors/:id", verifyToken, DoctorController.findById);
router.get("/doctors/:id/appointments", verifyToken, DoctorController.getAppointments);

export default router;