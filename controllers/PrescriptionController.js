import prescriptionService from '../services/PrescriptionService.js';

class PrescriptionController {
  async listAll(req, res) {
    try {
      const prescriptions = await prescriptionService.findAll();
      return res.status(200).json(prescriptions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      const prescription = await prescriptionService.findById(id);
      
      if (!prescription) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      return res.status(200).json(prescription);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const prescriptionData = req.body;
      const newPrescription = await prescriptionService.create(prescriptionData);
      return res.status(201).json(newPrescription);
    } catch (error) {
      if (error.message.includes('alérgico') || 
          error.message.includes('deve conter pelo menos') ||
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const prescriptionData = req.body;
      
      const updatedPrescription = await prescriptionService.update(id, prescriptionData);
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      return res.status(200).json(updatedPrescription);
    } catch (error) {
      if (error.message.includes('alérgico') || 
          error.message.includes('deve conter pelo menos') ||
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const deletedPrescription = await prescriptionService.delete(id);
      
      if (!deletedPrescription) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      return res.status(200).json({ message: 'Prescrição excluída com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByPacient(req, res) {
    try {
      const pacientID = req.params.pacientID;
      const prescriptions = await prescriptionService.findByPacient(pacientID);
      return res.status(200).json(prescriptions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByDoctor(req, res) {
    try {
      const doctorID = req.params.doctorID;
      const prescriptions = await prescriptionService.findByDoctor(doctorID);
      return res.status(200).json(prescriptions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByMedication(req, res) {
    try {
      const medication = req.params.medication;
      const prescriptions = await prescriptionService.findByMedication(medication);
      return res.status(200).json(prescriptions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  async registerDispensation(req, res) {
    try {
      const id = req.params.id;
      const dispensationData = req.body;
      
      if (!dispensationData.date) {
        dispensationData.date = new Date();
      }
      
      const updatedPrescription = await prescriptionService.registerDispensation(id, dispensationData);
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      return res.status(200).json(updatedPrescription);
    } catch (error) {
      if (error.message.includes('expirada') || error.message.includes('já dispensada')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PrescriptionController();