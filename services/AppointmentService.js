import appointmentRepository from "../repositories/AppointmentRepository.js";

// Métodos de CRUD básicos
const findAll = async () => {
    return appointmentRepository.findAll();
};

const findById = async (id) => {
    return appointmentRepository.findById(id);
};

const create = async (appointmentData) => {
    // Aqui podemos adicionar regras de negócio antes de salvar
    // Por exemplo, verificar se o médico está disponível
    const isAvailable = await checkAvailability(
        appointmentData.doctorID,
        appointmentData.date,
        appointmentData.duration || 30
    );
    
    if (!isAvailable) {
        throw new Error('Médico já possui um agendamento neste horário');
    }
    
    return appointmentRepository.create(appointmentData);
};

const update = async (id, appointmentData) => {
    // Podemos adicionar regras de negócio para atualização também
    // Por exemplo, verificar se a data foi alterada e se o médico está disponível
    const currentAppointment = await appointmentRepository.findById(id);
    
    if (!currentAppointment) {
        throw new Error('Agendamento não encontrado');
    }
    
    // Se a data ou médico foram alterados, verificar disponibilidade
    if (appointmentData.date && 
        (appointmentData.date.toString() !== currentAppointment.date.toString() ||
         appointmentData.doctorID.toString() !== currentAppointment.doctorID.toString())) {
        
        const isAvailable = await checkAvailability(
            appointmentData.doctorID || currentAppointment.doctorID,
            appointmentData.date || currentAppointment.date,
            appointmentData.duration || currentAppointment.duration || 30
        );
        
        if (!isAvailable) {
            throw new Error('Médico já possui um agendamento neste horário');
        }
    }
    
    return appointmentRepository.update(id, appointmentData);
};

const remove = async (id) => {
    return appointmentRepository.remove(id);
};

// Métodos de consulta especializados
const findByDoctor = async (doctorID) => {
    return appointmentRepository.findByDoctor(doctorID);
};

const findByPacient = async (pacientID) => {
    return appointmentRepository.findByPacient(pacientID);
};

const findByDate = async (date) => {
    return appointmentRepository.findByDate(date);
};

const checkAvailability = async (doctorID, dateTime, duration) => {
    return appointmentRepository.checkAvailability(doctorID, dateTime, duration);
};

const appointmentService = {
    findAll,
    findById,
    create,
    update,
    delete: remove, // Usando alias para manter compatibilidade com o Controller
    findByDoctor,
    findByPacient,
    findByDate,
    checkAvailability
};

export default appointmentService;