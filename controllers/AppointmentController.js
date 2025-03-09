import appointmentService from '../services/AppointmentService.js';

class AppointmentController {
  async listAll(req, res) {
    try {
      const appointments = await appointmentService.findAll();
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      const appointment = await appointmentService.findById(id);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      
      return res.status(200).json(appointment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const appointmentData = req.body;
      const newAppointment = await appointmentService.create(appointmentData);
      return res.status(201).json(newAppointment);
    } catch (error) {
      if (error.message.includes('validação') || 
          error.message.includes('Médico já possui') || 
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const appointmentData = req.body;
      
      const updatedAppointment = await appointmentService.update(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      
      return res.status(200).json(updatedAppointment);
    } catch (error) {
      if (error.message.includes('validação') || 
          error.message.includes('Médico já possui') ||
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const deletedAppointment = await appointmentService.delete(id);
      
      if (!deletedAppointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      
      return res.status(200).json({ message: 'Agendamento excluído com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByDoctor(req, res) {
    try {
      const doctorID = req.params.doctorID;
      const appointments = await appointmentService.findByDoctor(doctorID);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByPacient(req, res) {
    try {
      const pacientID = req.params.pacientID;
      const appointments = await appointmentService.findByPacient(pacientID);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByDate(req, res) {
    try {
      const date = req.params.date;
      const appointments = await appointmentService.findByDate(date);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  async checkAvailability(req, res) {
    try {
      const { doctorID, dateTime, duration } = req.query;
      
      if (!doctorID || !dateTime) {
        return res.status(400).json({ error: 'Médico e data/hora são obrigatórios' });
      }
      
      const isAvailable = await appointmentService.checkAvailability(
        doctorID, 
        new Date(dateTime), 
        duration || 30
      );
      
      return res.status(200).json({ available: isAvailable });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new AppointmentController();