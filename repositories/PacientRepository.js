import Pacient from "../models/Pacient.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";

// Métodos de CRUD básicos
const findAll = async (filters = {}) => {
    try {
        console.log("PacientRepository.findAll aplicando filtros:", filters);
        return await Pacient.find(filters);
    } catch (error) {
        throw new Error(`Erro ao buscar pacientes: ${error.message}`);
    }
};

const findById = async (id) => {
    try {
        return await Pacient.findById(id);
    } catch (error) {
        throw new Error(`Erro ao buscar paciente: ${error.message}`);
    }
};

const create = async (pacientData) => {
    try {
        const pacient = new Pacient(pacientData);
        return await pacient.save();
    } catch (error) {
        throw new Error(`Erro ao criar paciente: ${error.message}`);
    }
};

const update = async (id, pacientData) => {
    try {
        return await Pacient.findByIdAndUpdate(
            id, 
            pacientData, 
            {new: true, runValidators: true}
        );
    } catch (error) {
        throw new Error(`Erro ao atualizar paciente: ${error.message}`);
    }
};

const remove = async (id) => {
    try {
        console.log("PacientRepository.remove: Executando exclusão física do ID:", id);
        return await Pacient.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Erro ao excluir paciente: ${error.message}`);
    }
};

// Métodos de consulta especializados
const findByName = async (filters) => {
    try {
        console.log("PacientRepository.findByName com filtros:", filters);
        return await Pacient.find(filters);
    } catch (error) {
        throw new Error(`Erro ao buscar pacientes por nome: ${error.message}`);
    }
};

const findByCpf = async (filters) => {
    try {
        console.log("PacientRepository.findByCpf com filtros:", filters);
        return await Pacient.findOne(filters);
    } catch (error) {
        throw new Error(`Erro ao buscar paciente por CPF: ${error.message}`);
    }
};

const getMedicalHistory = async (pacientId) => {
    try {
        // Buscar agendamentos
        const appointments = await Appointment.find({ pacientID: pacientId })
            .populate('doctorID')
            .sort({ date: -1 });
            
        // Buscar prescrições
        const prescriptions = await Prescription.find({ pacientID: pacientId })
            .populate('doctorID')
            .sort({ issueDate: -1 });
        
        // Combinar em um histórico único ordenado por data
        const history = [
            ...appointments.map(app => ({
                type: 'appointment',
                date: app.date,
                doctor: app.doctorID,
                details: app.notes || 'Sem observações',
                id: app._id
            })),
            ...prescriptions.map(pres => ({
                type: 'prescription',
                date: pres.issueDate,
                doctor: pres.doctorID,
                details: pres.medications.map(med => med.name).join(', '),
                id: pres._id
            }))
        ];
        
        // Ordenar por data (mais recente primeiro)
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        throw new Error(`Erro ao buscar histórico médico: ${error.message}`);
    }
};

const getPrescriptions = async (pacientId) => {
    try {
        return await Prescription.find({ pacientID: pacientId })
            .populate('doctorID')
            .sort({ issueDate: -1 });
    } catch (error) {
        throw new Error(`Erro ao buscar prescrições do paciente: ${error.message}`);
    }
};

const getAppointments = async (pacientId) => {
    try {
        return await Appointment.find({ pacientID: pacientId })
            .populate('doctorID')
            .sort({ date: 1 });
    } catch (error) {
        throw new Error(`Erro ao buscar agendamentos do paciente: ${error.message}`);
    }
};

const pacientRepository = {
    findAll,
    findById,
    create,
    update,
    remove,
    findByName,
    findByCpf,
    getMedicalHistory,
    getPrescriptions,
    getAppointments
};

export default pacientRepository;