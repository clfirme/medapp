import pacientRepository from "../repositories/PacientRepository.js";
import appointmentRepository from "../repositories/AppointmentRepository.js";
import prescriptionRepository from "../repositories/PrescriptionRepository.js";

// Métodos de CRUD básicos
const findAll = async (filters = {}) => {
    console.log("PacientService.findAll recebeu filtros:", filters);
    return pacientRepository.findAll(filters);
};

const findById = async (id) => {
    return pacientRepository.findById(id);
};

const create = async (pacientData) => {
    // Validar CPF único
    if (pacientData.cpf) {
        const formattedCpf = pacientData.cpf.replace(/\D/g, '');
        const existingPacient = await pacientRepository.findByCpf({ cpf: formattedCpf });
        
        if (existingPacient) {
            throw new Error('CPF já cadastrado no sistema');
        }
        
        // Validar formato de CPF (simplificado)
        if (formattedCpf.length !== 11) {
            throw new Error('Formato de CPF inválido');
        }
    }
    
    // Validar data de nascimento
    if (pacientData.birthDate) {
        const birthDate = new Date(pacientData.birthDate);
        const today = new Date();
        
        if (birthDate > today) {
            throw new Error('Data de nascimento não pode ser no futuro');
        }
        
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
            throw new Error('Idade inválida');
        }
    }
    
    return pacientRepository.create(pacientData);
};

const update = async (id, pacientData) => {
    // Verificar se o paciente existe
    const pacient = await pacientRepository.findById(id);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    // Validar CPF único (se fornecido)
    if (pacientData.cpf && pacientData.cpf !== pacient.cpf) {
        const formattedCpf = pacientData.cpf.replace(/\D/g, '');
        const existingPacient = await pacientRepository.findByCpf({ cpf: formattedCpf });
        
        if (existingPacient && existingPacient._id.toString() !== id) {
            throw new Error('CPF já cadastrado no sistema para outro paciente');
        }
        
        // Validar formato de CPF (simplificado)
        if (formattedCpf.length !== 11) {
            throw new Error('Formato de CPF inválido');
        }
    }
    
    // Validar data de nascimento (se fornecida)
    if (pacientData.birthDate) {
        const birthDate = new Date(pacientData.birthDate);
        const today = new Date();
        
        if (birthDate > today) {
            throw new Error('Data de nascimento não pode ser no futuro');
        }
        
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
            throw new Error('Idade inválida');
        }
    }
    
    return pacientRepository.update(id, pacientData);
};

const remove = async (id) => {
    // Verificar se existem agendamentos ou prescrições vinculadas
    const appointments = await appointmentRepository.findByPacient(id);
    if (appointments.length > 0) {
        throw new Error('Não é possível excluir paciente com consultas vinculadas');
    }
    
    const prescriptions = await prescriptionRepository.findByPacient(id);
    if (prescriptions.length > 0) {
        throw new Error('Não é possível excluir paciente com prescrições vinculadas');
    }
    
    return pacientRepository.remove(id);
};

// Métodos de consulta especializados
const findByName = async (name, additionalFilters = {}) => {
    console.log("PacientService.findByName recebeu:", name, additionalFilters);
    const combinedFilters = {
        name: { $regex: name, $options: 'i' },
        ...additionalFilters
    };
    return pacientRepository.findByName(combinedFilters);
};

const findByCpf = async (cpf, additionalFilters = {}) => {
    console.log("PacientService.findByCpf recebeu:", cpf, additionalFilters);
    // Remover caracteres não numéricos para padronização
    const formattedCpf = cpf.replace(/\D/g, '');
    const combinedFilters = {
        cpf: formattedCpf,
        ...additionalFilters
    };
    return pacientRepository.findByCpf(combinedFilters);
};

const getMedicalHistory = async (pacientId) => {
    // Verificar se o paciente existe
    const pacient = await pacientRepository.findById(pacientId);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    return pacientRepository.getMedicalHistory(pacientId);
};

const getPrescriptions = async (pacientId) => {
    // Verificar se o paciente existe
    const pacient = await pacientRepository.findById(pacientId);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    return pacientRepository.getPrescriptions(pacientId);
};

const getAppointments = async (pacientId) => {
    // Verificar se o paciente existe
    const pacient = await pacientRepository.findById(pacientId);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    return pacientRepository.getAppointments(pacientId);
};

const pacientService = {
    findAll,
    findById,
    create,
    update,
    delete: remove,
    findByName,
    findByCpf,
    getMedicalHistory,
    getPrescriptions,
    getAppointments
};

export default pacientService;