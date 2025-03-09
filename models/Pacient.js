import mongoose from 'mongoose';
const { Schema } = mongoose;

const pacientSchema = new Schema({
  // Informações básicas
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  
  // Número de identificação (CPF)
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Remove caracteres não numéricos para validação
        const cpf = v.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais, o que é inválido
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação simplificada de CPF
        return true;
      },
      message: props => `${props.value} não é um CPF válido!`
    }
  },
  
  // Data de nascimento
  birthDate: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória'],
    validate: {
      validator: function(date) {
        return date <= new Date(); // Não pode ser no futuro
      },
      message: 'Data de nascimento não pode ser no futuro'
    }
  },
  
  // Gênero
  gender: {
    type: String,
    enum: ['masculino', 'feminino', 'outro', 'prefiro não informar'],
    default: 'prefiro não informar'
  },
  
  // Informações de contato
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    address: {
      street: String,
      number: String,
      complement: String,
      neighborhood: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  
  // Informações de saúde
  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconhecido'],
      default: 'desconhecido'
    },
    weight: Number, // em kg
    height: Number, // em cm
    
    // Condições médicas preexistentes
    medicalConditions: [{
      type: String,
      trim: true
    }],
    
    // Alergias
    allergies: [{
      type: String,
      trim: true
    }],
    
    // Medicamentos em uso contínuo
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date
    }],
    
    // Cirurgias anteriores
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      notes: String
    }],
    
    // Histórico familiar de doenças
    familyHistory: [{
      condition: String,
      relationship: String
    }]
  },
  
  // Informações do convênio/plano de saúde
  insuranceInfo: {
    provider: String,
    planType: String,
    policyNumber: String,
    expirationDate: Date
  },
  
  // Notas gerais sobre o paciente
  notes: {
    type: String,
    trim: true
  },
  
  // Consentimentos e preferências
  preferences: {
    // Preferência de comunicação
    communicationPreference: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'telefone'],
      default: 'whatsapp'
    },
    
    // Consentimento para compartilhamento de dados
    dataSharing: {
      type: Boolean,
      default: false
    },
    
    // Consentimento para pesquisas clínicas
    researchParticipation: {
      type: Boolean,
      default: false
    }
  },
  
  // Status do paciente no sistema
  active: {
    type: Boolean,
    default: true
  },

  // Nova inclusão: paciente do médico usuário
  // Note a vírgula adicionada após o campo active
  doctorID: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Médico responsável é obrigatório']
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
pacientSchema.index({ 'name': 'text' }); // Para busca por texto no nome
pacientSchema.index({ 'healthInfo.allergies': 1 }); // Para buscar pacientes com alergias específicas
pacientSchema.index({ 'doctorID': 1 }); // Novo índice para melhorar consultas por médico

// Virtual para idade do paciente
pacientSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  
  // Ajusta a idade se o aniversário ainda não ocorreu este ano
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual para nome completo formatado e idade
pacientSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.age} anos)`;
});

// Método para verificar se o paciente tem alergia a um medicamento específico
pacientSchema.methods.isAllergicTo = function(medication) {
  if (!this.healthInfo || !this.healthInfo.allergies) return false;
  
  return this.healthInfo.allergies.some(allergy => 
    allergy.toLowerCase().includes(medication.toLowerCase())
  );
};

const Pacient = mongoose.model('Pacient', pacientSchema);

export default Pacient;