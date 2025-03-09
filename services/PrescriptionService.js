import prescriptionRepository from "../repositories/PrescriptionRepository.js";
import doctorRepository from "../repositories/DoctorRepository.js";
import pacientRepository from "../repositories/PacientRepository.js";

// Métodos de CRUD básicos
const findAll = async () => {
    return prescriptionRepository.findAll();
};

const findById = async (id) => {
    return prescriptionRepository.findById(id);
};

const create = async (prescriptionData) => {
    // Validar existência do médico
    const doctor = await doctorRepository.findById(prescriptionData.doctorID);
    if (!doctor) {
        throw new Error('Médico não encontrado');
    }
    
    // Validar existência do paciente
    const pacient = await pacientRepository.findById(prescriptionData.pacientID);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    // Validar medicamentos
    if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
        throw new Error('A prescrição deve conter pelo menos um medicamento');
    }
    
    // Verificar se o paciente tem alergia a algum dos medicamentos
    if (pacient.healthInfo && pacient.healthInfo.allergies) {
        for (const medication of prescriptionData.medications) {
            for (const allergy of pacient.healthInfo.allergies) {
                if (medication.name.toLowerCase().includes(allergy.toLowerCase())) {
                    throw new Error(`Paciente é alérgico a ${medication.name}`);
                }
            }
        }
    }
    
    return prescriptionRepository.create(prescriptionData);
};

const update = async (id, prescriptionData) => {
    // Verificar se a prescrição existe
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) {
        throw new Error('Prescrição não encontrada');
    }
    
    // Validar existência do médico (se fornecido)
    if (prescriptionData.doctorID) {
        const doctor = await doctorRepository.findById(prescriptionData.doctorID);
        if (!doctor) {
            throw new Error('Médico não encontrado');
        }
    }
    
    // Validar existência do paciente (se fornecido)
    if (prescriptionData.pacientID) {
        const pacient = await pacientRepository.findById(prescriptionData.pacientID);
        if (!pacient) {
            throw new Error('Paciente não encontrado');
        }
    }
    
    // Validar medicamentos (se fornecidos)
    if (prescriptionData.medications) {
        if (prescriptionData.medications.length === 0) {
            throw new Error('A prescrição deve conter pelo menos um medicamento');
        }
        
        // Verificar alergias
        const pacient = await pacientRepository.findById(
            prescriptionData.pacientID || prescription.pacientID
        );
        
        if (pacient.healthInfo && pacient.healthInfo.allergies) {
            for (const medication of prescriptionData.medications) {
                for (const allergy of pacient.healthInfo.allergies) {
                    if (medication.name.toLowerCase().includes(allergy.toLowerCase())) {
                        throw new Error(`Paciente é alérgico a ${medication.name}`);
                    }
                }
            }
        }
    }
    
    return prescriptionRepository.update(id, prescriptionData);
};

const remove = async (id) => {
    // Verificar se a prescrição existe
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) {
        throw new Error('Prescrição não encontrada');
    }
    
    // Verificar se já foi dispensada
    if (prescription.status === 'dispensada') {
        throw new Error('Não é possível excluir prescrição já dispensada');
    }
    
    return prescriptionRepository.remove(id);
};

// Métodos de consulta especializados
const findByPacient = async (pacientID) => {
    // Verificar se o paciente existe
    const pacient = await pacientRepository.findById(pacientID);
    if (!pacient) {
        throw new Error('Paciente não encontrado');
    }
    
    return prescriptionRepository.findByPacient(pacientID);
};

const findByDoctor = async (doctorID) => {
    // Verificar se o médico existe
    const doctor = await doctorRepository.findById(doctorID);
    if (!doctor) {
        throw new Error('Médico não encontrado');
    }
    
    return prescriptionRepository.findByDoctor(doctorID);
};

const findByMedication = async (medication) => {
    return prescriptionRepository.findByMedication(medication);
};

const registerDispensation = async (id, dispensationData) => {
    // Verificar se a prescrição existe
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) {
        throw new Error('Prescrição não encontrada');
    }
    
    // Verificar se a prescrição está ativa
    if (prescription.status !== 'ativa') {
        throw new Error('Prescrição não está ativa');
    }
    
    // Verificar se não está expirada
    const currentDate = new Date();
    if (prescription.expirationDate && currentDate > prescription.expirationDate) {
        throw new Error('Prescrição expirada');
    }
    
    // Adicionar data atual se não fornecida
    if (!dispensationData.date) {
        dispensationData.date = new Date();
    }
    
    return prescriptionRepository.registerDispensation(id, dispensationData);
};

const prescriptionService = {
    findAll,
    findById,
    create,
    update,
    delete: remove,
    findByPacient,
    findByDoctor,
    findByMedication,
    registerDispensation
};

export default prescriptionService;