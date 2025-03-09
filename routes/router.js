import express from "express";
import appointmentRoutes from "./AppointmentRoutes.js";
import doctorRoutes from "./DoctorRoutes.js";
import pacientRoutes from "./PacientRoutes.js";
import prescriptionRoutes from "./PrescriptionRoutes.js";
import verifyToken from '../middleware/authMiddleware.js';  // Importar o middleware de autenticação
import DoctorController from '../controllers/DoctorController.js';  // Importar o controlador

const router = express.Router();

router.get("/", (req, res) => {
  console.log("Hello!");
  res.status(200).json({message: "Hello!"});
});

router.use(appointmentRoutes);
router.use(doctorRoutes);
router.use(pacientRoutes);
router.use(prescriptionRoutes);

router.get("/doctors/me", verifyToken, DoctorController.getMe);

export default router;