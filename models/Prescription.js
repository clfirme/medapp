import mongoose from 'mongoose';
const { Schema } = mongoose;

const prescriptionSchema = new Schema({
  // Referências aos modelos relacionados
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Médico é obrigatório']
  },
  pacient: {
    type: Schema.Types.ObjectId,
    ref: 'Pacient',
    required: [true, 'Paciente é obrigatório']
  },
  
  // Consulta relacionada (opcional)
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Data da prescrição
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Data de validade da prescrição
  expirationDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return date > this.issueDate;
      },
      message: 'Data de validade deve ser posterior à data de emissão'
    }
  },
  
  // Medicamentos prescritos
  medications: [{
    name: {
      type: String,
      required: [true, 'Nome do medicamento é obrigatório'],
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosagem é obrigatória'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'Frequência é obrigatória'],
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    controlled: {
      type: Boolean,
      default: false
    }
  }],
  
  // Instruções gerais
  generalInstructions: {
    type: String,
    trim: true
  },
  
  // Diagnóstico relacionado
  diagnosis: {
    type: String,
    trim: true
  },
  
  // CID (Classificação Internacional de Doenças)
  icdCode: {
    type: String,
    trim: true
  },
  
  // Status da prescrição
  status: {
    type: String,
    enum: ['ativa', 'dispensada', 'cancelada', 'expirada'],
    default: 'ativa'
  },
  
  // Para prescrições contínuas/de uso prolongado
  refillInfo: {
    isRefillable: {
      type: Boolean,
      default: false
    },
    refillsAuthorized: {
      type: Number,
      default: 0
    },
    refillsUsed: {
      type: Number,
      default: 0
    },
    lastRefillDate: Date
  },
  
  // Para controle de dispensação em farmácia
  dispensation: [{
    date: Date,
    pharmacyName: String,
    pharmacist: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Índices para melhorar performance
prescriptionSchema.index({ doctor: 1, issueDate: -1 }); // Para buscar prescrições de um médico por data
prescriptionSchema.index({ pacient: 1, issueDate: -1 }); // Para buscar prescrições de um paciente por data
prescriptionSchema.index({ 'medications.name': 1 }); // Para buscar prescrições por medicamento

// Virtual para verificar se a prescrição está válida
prescriptionSchema.virtual('isValid').get(function() {
  const today = new Date();
  
  // Se não tem data de expiração, usa 30 dias da emissão como padrão
  if (!this.expirationDate) {
    const defaultExpiration = new Date(this.issueDate);
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);
    return today <= defaultExpiration && this.status === 'ativa';
  }
  
  return today <= this.expirationDate && this.status === 'ativa';
});

// Método para registrar dispensação
prescriptionSchema.methods.registerDispensation = async function(dispensationData) {
  // Adiciona a dispensação ao histórico
  this.dispensation.push(dispensationData);
  
  // Atualiza contagem de refills, se aplicável
  if (this.refillInfo.isRefillable) {
    this.refillInfo.refillsUsed += 1;
    this.refillInfo.lastRefillDate = dispensationData.date;
    
    // Se atingiu o limite de refills, altera o status
    if (this.refillInfo.refillsUsed >= this.refillInfo.refillsAuthorized) {
      this.status = 'dispensada';
    }
  } else {
    // Se não é refillable, marca como dispensada na primeira dispensação
    this.status = 'dispensada';
  }
  
  return this.save();
};

// Pré-save hook para definir data de expiração padrão se não fornecida
prescriptionSchema.pre('save', function(next) {
  if (!this.expirationDate) {
    // Define validade padrão de 30 dias para prescrições comuns
    const expirationDate = new Date(this.issueDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    this.expirationDate = expirationDate;
  }
  
  // Verifica se algum medicamento é controlado
  const hasControlledMeds = this.medications.some(med => med.controlled);
  
  // Se tem medicamentos controlados e validade > 30 dias, ajusta
  if (hasControlledMeds) {
    const maxExpirationForControlled = new Date(this.issueDate);
    maxExpirationForControlled.setDate(maxExpirationForControlled.getDate() + 30);
    
    if (this.expirationDate > maxExpirationForControlled) {
      this.expirationDate = maxExpirationForControlled;
    }
  }
  
  next();
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;