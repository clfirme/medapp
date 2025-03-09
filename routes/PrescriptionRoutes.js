// versao do professor
/*
import express from "express";

let router = express.Router();

export default router();*/

import express from "express";
import PrescriptionController from "../controllers/PrescriptionController.js";
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

/* // Basic CRUD routes sem autenticacao
router.get("/prescriptions", PrescriptionController.listAll);
router.get("/prescriptions/:id", PrescriptionController.findById);
router.post("/prescriptions", PrescriptionController.create);
router.put("/prescriptions/:id", PrescriptionController.update);
router.delete("/prescriptions/:id", PrescriptionController.delete); */

// Todas as rotas de prescrições protegidas
router.get("/prescriptions", verifyToken, PrescriptionController.listAll);
router.get("/prescriptions/:id", verifyToken, PrescriptionController.findById);
router.post("/prescriptions", verifyToken, PrescriptionController.create);
router.put("/prescriptions/:id", verifyToken, PrescriptionController.update);
router.delete("/prescriptions/:id", verifyToken, PrescriptionController.delete);

// Specialized routes
router.get("/prescriptions/pacient/:pacientID", PrescriptionController.findByPacient);
router.get("/prescriptions/doctor/:doctorID", PrescriptionController.findByDoctor);
router.get("/prescriptions/medication/:medication", PrescriptionController.findByMedication);
router.post("/prescriptions/:id/dispense", PrescriptionController.registerDispensation);

export default router;