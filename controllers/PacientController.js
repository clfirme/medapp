import pacientService from '../services/PacientService.js';
import Pacient from '../models/Pacient.js';

class PacientController {
  async listAll(req, res) {
    try {
      const filters = req.query;
      
      // Se não for admin, filtra por doctorID
      if (!req.isAdmin) {
        filters.doctorID = req.doctorID;
      }
      
      const pacients = await pacientService.findAll(filters);
      return res.status(200).json(pacients);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      const pacient = await pacientService.findById(id);
      
      if (!pacient) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }
      
      return res.status(200).json(pacient);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const pacientData = req.body;
      const newPacient = await pacientService.create(pacientData);
      return res.status(201).json(newPacient);
    } catch (error) {
      if (error.message.includes('CPF já cadastrado') || 
          error.message.includes('Formato de CPF inválido') ||
          error.message.includes('Data de nascimento') ||
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const pacientData = req.body;
      
      const updatedPacient = await pacientService.update(id, pacientData);
      
      if (!updatedPacient) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }
      
      return res.status(200).json(updatedPacient);
    } catch (error) {
      if (error.message.includes('CPF já cadastrado') || 
          error.message.includes('Formato de CPF inválido') ||
          error.message.includes('Data de nascimento') ||
          error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      console.log(`PacientController.delete: Tentando exclusão para patient ID: ${id}`);
      
      // Verificar se o ID é válido
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'ID de paciente inválido' });
      }
      
      // Verificar se o paciente existe primeiro
      const pacienteExistente = await Pacient.findById(id);
      console.log("Paciente existe?", pacienteExistente ? "Sim" : "Não");
      
      if (!pacienteExistente) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }
      
      // Tentar diferentes métodos de exclusão
      console.log("Tentando excluir com deleteOne...");
      const deleteResult = await Pacient.deleteOne({ _id: id });
      console.log("Resultado deleteOne:", deleteResult);
      
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Falha ao excluir paciente' });
      }
      
      // Verificar se o paciente ainda existe após a exclusão
      const pacienteAposExclusao = await Pacient.findById(id);
      console.log("Paciente ainda existe após exclusão?", pacienteAposExclusao ? "Sim" : "Não");
      
      return res.status(200).json({ 
        message: 'Paciente excluído com sucesso',
        deleteResult
      });
    } catch (error) {
      console.error("Erro detalhado na exclusão de paciente:", error);
      return res.status(500).json({ 
        error: error.message,
        stack: error.stack
      });
    }
  }

  async getMedicalHistory(req, res) {
    try {
      const pacientId = req.params.id;
      const history = await pacientService.getMedicalHistory(pacientId);
      return res.status(200).json(history);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPrescriptions(req, res) {
    try {
      const pacientId = req.params.id;
      const prescriptions = await pacientService.getPrescriptions(pacientId);
      return res.status(200).json(prescriptions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAppointments(req, res) {
    try {
      const pacientId = req.params.id;
      const appointments = await pacientService.getAppointments(pacientId);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  async listByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      
      // Verificar se o usuário é o médico em questão ou é admin
      if (!req.isAdmin && req.doctorID !== doctorId) {
        return res.status(403).json({ 
          message: 'Acesso negado. Você só pode ver seus próprios pacientes.' 
        });
      }
      
      // Usar o serviço existente com o filtro de doctorID
      const pacients = await pacientService.findAll({ doctorID: doctorId });
      
      return res.status(200).json(pacients);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async search(req, res) {
    try {
      const { name, cpf } = req.query;
      
      if (!name && !cpf) {
        return res.status(400).json({ error: 'É necessário fornecer um nome ou CPF para pesquisa' });
      }
      
      let results;
      
      if (cpf) {
        results = await pacientService.findByCpf(cpf);
      } else {
        results = await pacientService.findByName(name);
      }
      
      return res.status(200).json(results || []);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PacientController();