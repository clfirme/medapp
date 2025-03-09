import Prescription from "../models/Prescription.js";

// Métodos de CRUD básicos
const findAll = async () => {
    try {
        return await Prescription.find()
            .populate('doctorID')
            .populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar prescrições: ${error.message}`);
    }
};

const findById = async (id) => {
    try {
        return await Prescription.findById(id)
            .populate('doctorID')
            .populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar prescrição: ${error.message}`);
    }
};

const create = async (prescriptionData) => {
    try {
        const prescription = new Prescription(prescriptionData);
        return await prescription.save();
    } catch (error) {
        throw new Error(`Erro ao criar prescrição: ${error.message}`);
    }
};

const update = async (id, prescriptionData) => {
    try {
        return await Prescription.findByIdAndUpdate(
            id, 
            prescriptionData, 
            {new: true, runValidators: true}
        ).populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao atualizar prescrição: ${error.message}`);
    }
};

const remove = async (id) => {
    try {
        return await Prescription.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Erro ao excluir prescrição: ${error.message}`);
    }
};

// Métodos de consulta especializados
const findByPacient = async (pacientID) => {
    try {
        return await Prescription.find({ pacientID })
            .populate('doctorID')
            .sort({ issueDate: -1 });
    } catch (error) {
        throw new Error(`Erro ao buscar prescrições por paciente: ${error.message}`);
    }
};

const findByDoctor = async (doctorID) => {
    try {
        return await Prescription.find({ doctorID })
            .populate('pacientID')
            .sort({ issueDate: -1 });
    } catch (error) {
        throw new Error(`Erro ao buscar prescrições por médico: ${error.message}`);
    }
};

const findByMedication = async (medication) => {
    try {
        return await Prescription.find({
            'medications.name': { $regex: medication, $options: 'i' }
        }).populate('doctorID').populate('pacientID');
    } catch (error) {
        throw new Error(`Erro ao buscar prescrições por medicamento: ${error.message}`);
    }
};

const registerDispensation = async (id, dispensationData) => {
    try {
        // Obter a prescrição
        const prescription = await Prescription.findById(id);
        
        if (!prescription) {
            return null;
        }
        
        // Adicionar dispensação
        prescription.dispensation.push(dispensationData);
        
        // Atualizar contagem de refills se aplicável
        if (prescription.refillInfo && prescription.refillInfo.isRefillable) {
            prescription.refillInfo.refillsUsed += 1;
            prescription.refillInfo.lastRefillDate = dispensationData.date;
            
            // Se atingiu o limite de refills, altera o status
            if (prescription.refillInfo.refillsUsed >= prescription.refillInfo.refillsAuthorized) {
                prescription.status = 'dispensada';
            }
        } else {
            // Se não é refillable, marca como dispensada
            prescription.status = 'dispensada';
        }
        
        return await prescription.save();
    } catch (error) {
        throw new Error(`Erro ao registrar dispensação: ${error.message}`);
    }
};

const prescriptionRepository = {
    findAll,
    findById,
    create,
    update,
    remove,
    findByPacient,
    findByDoctor,
    findByMedication,
    registerDispensation
};

export default prescriptionRepository;