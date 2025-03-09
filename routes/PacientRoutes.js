import express from "express";
import PacientController from "../controllers/PacientController.js";
import verifyToken, { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas as rotas de pacientes protegidas
router.get("/pacients", verifyToken, PacientController.listAll);
router.get("/pacients/doctor/:doctorId", verifyToken, PacientController.listByDoctor);
router.get("/pacients/search", verifyToken, PacientController.search); // Movida para cima

// Rotas com parâmetro :id
router.get("/pacients/:id", verifyToken, PacientController.findById);
router.get("/pacients/:id/medical-history", verifyToken, PacientController.getMedicalHistory);
router.get("/pacients/:id/prescriptions", verifyToken, PacientController.getPrescriptions);
router.get("/pacients/:id/appointments", verifyToken, PacientController.getAppointments);

// Outras rotas
router.post("/pacients", verifyToken, PacientController.create);
router.put("/pacients/:id", verifyToken, PacientController.update);
router.delete("/pacients/:id", verifyToken, PacientController.delete);

export default router;