import Appointment from "../models/Appointment.js";

// Métodos de CRUD básicos
const findAll = async () => {
    try {
        return await Appointment.find().populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
};

const findById = async (id) => {
    try {
        return await Appointment.findById(id).populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
};

const create = async (appointmentData) => {
    try {
        const appointment = new Appointment(appointmentData);
        return await appointment.save();
    } catch (error) {
        throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
};

const update = async (id, appointmentData) => {
    try {
        return await Appointment.findByIdAndUpdate(
            id, 
            appointmentData, 
            {new: true, runValidators: true}
        ).populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
};

const remove = async (id) => {
    try {
        return await Appointment.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Erro ao excluir agendamento: ${error.message}`);
    }
};

// Métodos de consulta especializados
const findByDoctor = async (doctorID) => {
    try {
        return await Appointment.find({ doctorID }).populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos por médico: ${error.message}`);
    }
};

const findByPacient = async (pacientID) => {
    try {
        return await Appointment.find({ pacientID }).populate('doctorID');
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos por paciente: ${error.message}`);
    }
};

const findByDate = async (date) => {
    try {
        // Criar intervalo para a data (início e fim do dia)
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        return await Appointment.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos por data: ${error.message}`);
    }
};

const checkAvailability = async (doctorID, dateTime, duration) => {
    try {
        const startTime = new Date(dateTime);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        
        // Verifica se já existe agendamento para o médico nesse horário
        const conflictingAppointment = await Appointment.findOne({
            doctorID,
            date: { 
                $lt: endTime,
                $gt: new Date(startTime.getTime() - 60000) // 1 minuto antes para garantir
            }
        });
        
        return !conflictingAppointment; // retorna true se não houver conflito
    } catch (error) {
        throw new Error(`Erro ao verificar disponibilidade: ${error.message}`);
    }
};

const appointmentRepository = {
    findAll,
    findById,
    create,
    update,
    remove, // usando 'remove' em vez de 'delete' para evitar palavra reservada
    findByDoctor,
    findByPacient,
    findByDate,
    checkAvailability
};

export default appointmentRepository;