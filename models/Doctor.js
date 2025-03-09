import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; 

const { Schema } = mongoose;

const doctorSchema = new Schema({
  // Informações básicas
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  
  // Senha para autenticação
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter no mínimo 8 caracteres'],
    // Em produção, a senha seria armazenada como hash, não como texto puro
    select: false // Não inclui este campo por padrão em consultas
  },
  
  // CRM (Registro médico)
  crm: {
    type: String,
    required: [true, 'CRM é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{5,6}(-[A-Z]{2})?$/.test(v); // Valida formato: 12345 ou 12345-SP
      },
      message: props => `${props.value} não é um CRM válido!`
    }
  },
  
  // Campo de administrador (adicionado)
  isAdmin: {
    type: Boolean,
    default: false // Por padrão, novos médicos não são administradores
  },
  
  // Especialidade médica
  specialty: {
    type: String,
    required: [true, 'Especialidade é obrigatória'],
    trim: true,
    enum: [
      'Clínico Geral',
      'Cardiologia',
      'Dermatologia',
      'Neurologia',
      'Pediatria',
      'Ortopedia',
      'Ginecologia',
      'Oftalmologia',
      'Psiquiatria',
      'Urologia',
      'Endocrinologia',
      'Otorrinolaringologia',
      'Geriatria'
    ]
  },
  
  // Informações de contato
  contact: {
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  
  // Horários de disponibilidade
  availability: {
    // Dias da semana disponíveis (0: domingo, 1: segunda, ..., 6: sábado)
    daysOfWeek: {
      type: [Number],
      default: [1, 2, 3, 4, 5] // Por padrão, disponível de segunda a sexta
    },
    
    // Horário de início do atendimento (formato "HH:MM")
    startTime: {
      type: String,
      default: "08:00"
    },
    
    // Horário de término do atendimento (formato "HH:MM")
    endTime: {
      type: String,
      default: "18:00"
    },
    
    // Duração padrão das consultas (em minutos)
    appointmentDuration: {
      type: Number,
      default: 30,
      min: [15, 'Duração mínima é de 15 minutos'],
      max: [120, 'Duração máxima é de 120 minutos']
    },
    
    // Período de almoço
    lunchBreak: {
      start: {
        type: String,
        default: "12:00"
      },
      end: {
        type: String,
        default: "13:00"
      }
    },
    
    // Datas específicas em que o médico não está disponível
    unavailableDates: [{
      date: Date,
      reason: String
    }]
  },
  
  // Formação acadêmica
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number
  }],
  
  // Status do médico no sistema
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
doctorSchema.index({ specialty: 1, active: 1 }); // Para buscar médicos ativos por especialidade
doctorSchema.index({ name: 'text' }); // Para busca por texto no nome

// Virtual para nome completo formatado
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.name}`;
});

// Método para verificar disponibilidade em uma data específica
doctorSchema.methods.isAvailable = function(date) {
  const requestedDate = new Date(date);
  const dayOfWeek = requestedDate.getDay();
  
  // Verifica se o dia da semana está nos dias disponíveis
  if (!this.availability.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }
  
  // Verifica se a data está na lista de datas indisponíveis
  const unavailable = this.availability.unavailableDates.some(item => {
    const itemDate = new Date(item.date);
    return itemDate.toDateString() === requestedDate.toDateString();
  });
  
  return !unavailable;
};

// Método para comparar senha usando bcrypt
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // O bcrypt.compare compara a senha fornecida com o hash armazenado
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Erro ao comparar senha: ${error.message}`);
  }
};

// Middleware pre-save para hash de senha
doctorSchema.pre('save', async function(next) {
// Só faz hash da senha se ela foi modificada (ou é nova)
   if (!this.isModified('password')) return next(); 
   try {
  // Gera um salt e hash a senha
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
     next();
   } catch (error) {
     next(error);
   }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;