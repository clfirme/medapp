import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// Métodos de CRUD básicos
const findAll = async (filters = {}) => {
    try {
        return await Doctor.find(filters);
    } catch (error) {
        throw new Error(`Erro ao buscar médicos: ${error.message}`);
    }
};

const findById = async (id) => {
    try {
        return await Doctor.findById(id);
    } catch (error) {
        throw new Error(`Erro ao buscar médico: ${error.message}`);
    }
};

const create = async (doctorData) => {
    try {
        const doctor = new Doctor(doctorData);
        return await doctor.save();
    } catch (error) {
        throw new Error(`Erro ao criar médico: ${error.message}`);
    }
};

const update = async (id, doctorData) => {
    try {
        return await Doctor.findByIdAndUpdate(
            id, 
            doctorData, 
            {new: true, runValidators: true}
        );
    } catch (error) {
        throw new Error(`Erro ao atualizar médico: ${error.message}`);
    }
};

const remove = async (id) => {
    try {
        return await Doctor.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Erro ao excluir médico: ${error.message}`);
    }
};

// Métodos de consulta especializados
const findBySpecialty = async (specialty) => {
    try {
        return await Doctor.find({ specialty, active: true });
    } catch (error) {
        throw new Error(`Erro ao buscar médicos por especialidade: ${error.message}`);
    }
};

const findAvailableByDate = async (date) => {
    try {
        // Obter todos os médicos ativos
        const doctors = await Doctor.find({ active: true });
        
        // Para cada médico, verificar disponibilidade na data
        const availableDoctors = [];
        
        for (const doctor of doctors) {
            // Verificar se o médico está disponível na data específica
            const isAvailable = doctor.isAvailable(new Date(date));
            
            if (isAvailable) {
                // Buscar agendamentos existentes para encontrar horários ocupados
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                
                const appointments = await Appointment.find({
                    doctorID: doctor._id,
                    date: { $gte: startDate, $lte: endDate }
                });
                
                // Determinar horários ocupados
                const busySlots = appointments.map(app => {
                    const appDate = new Date(app.date);
                    return appDate.getHours();
                });
                
                // Determinar horários disponíveis (assumindo horário de 8h às 18h)
                const availableSlots = [];
                for (let hour = 8; hour < 18; hour++) {
                    if (!busySlots.includes(hour)) {
                        availableSlots.push(hour);
                    }
                }
                
                availableDoctors.push({
                    doctor,
                    availableSlots,
                    totalAvailableSlots: availableSlots.length
                });
            }
        }
        
        return availableDoctors;
    } catch (error) {
        throw new Error(`Erro ao buscar médicos disponíveis por data: ${error.message}`);
    }
};

const getAppointments = async (doctorId) => {
    try {
        return await Appointment.find({ doctorID: doctorId })
            .populate('pacientID')
            .sort({ date: 1 });
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos do médico: ${error.message}`);
    }
};

const authenticate = async (crm, password) => {
    try {
        // Buscar médico pelo CRM
        const doctor = await Doctor.findOne({ crm }).select('+password');
        
        if (!doctor) {
            return { success: false };
        }
        
        // Em um sistema real, você usaria bcrypt.compare() aqui
        const isPasswordValid = doctor.comparePassword(password);
        
        if (!isPasswordValid) {
            return { success: false };
        }
        
        // Remover a senha antes de retornar o objeto
        const doctorObj = doctor.toObject();
        delete doctorObj.password;
        
        return { success: true, doctor: doctorObj };
    } catch (error) {
        throw new Error(`Erro na autenticação: ${error.message}`);
    }
};

// Método para buscar médico pelo CRM (usado na autenticação)
const findByCrm = async (crm, options = {}) => {
    try {
      const query = Doctor.findOne({ crm });
      
      // Incluir campo password se necessário para autenticação
      if (options.includePassword) {
        query.select('+password');
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Erro ao buscar médico por CRM: ${error.message}`);
    }
  };

const doctorRepository = {
    findAll,
    findById,
    create,
    update,
    remove,
    findBySpecialty,
    findAvailableByDate,
    getAppointments,
    authenticate,
    findByCrm  // Adicione esta linha aqui
};

export default doctorRepository;