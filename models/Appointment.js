import mongoose from 'mongoose';
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  // Referências aos modelos relacionados
doctorID: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Médico é obrigatório']
  },
  pacientID: {
    type: Schema.Types.ObjectId,
    ref: 'Pacient',
    required: [true, 'Paciente é obrigatório']
  },
  
  // Data e hora da consulta
  dateTime: {
    type: Date,
    required: [true, 'Data e hora são obrigatórios'],
    validate: {
      validator: function(date) {
        return date > new Date(); // Garante que a data seja futura
      },
      message: 'A data da consulta deve ser no futuro'
    }
  },
  
  // Duração da consulta em minutos
  duration: {
    type: Number,
    default: 30,
    min: [15, 'Duração mínima é de 15 minutos'],
    max: [120, 'Duração máxima é de 120 minutos']
  },
  
  // Status da consulta
  status: {
    type: String,
    enum: ['agendada', 'confirmada', 'realizada', 'cancelada'],
    default: 'agendada'
  },
  
  // Tipo de consulta
  type: {
    type: String,
    enum: ['primeira consulta', 'retorno', 'emergência'],
    default: 'primeira consulta'
  },
  
  // Notas ou observações da consulta
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notas não podem exceder 1000 caracteres']
  },
  
  // Sintomas relatados pelo paciente
  symptoms: [{
    type: String,
    trim: true
  }],
  
  // Diagnóstico (preenchido após a consulta)
  diagnosis: {
    type: String,
    trim: true
  },
  
  // Campo para controle de pagamento
  payment: {
    status: {
      type: String,
      enum: ['pendente', 'pago', 'reembolsado'],
      default: 'pendente'
    },
    method: {
      type: String,
      enum: ['dinheiro', 'cartão', 'convênio', 'pix', 'outro'],
    },
    amount: {
      type: Number,
      min: 0
    }
  }
}, {
  // Adiciona createdAt e updatedAt automaticamente
  timestamps: true
});

// Índices para melhorar a performance de consultas comuns
appointmentSchema.index({ doctor: 1, dateTime: 1 }); // Para buscar consultas de um médico em ordem de data
appointmentSchema.index({ pacient: 1, dateTime: 1 }); // Para buscar consultas de um paciente em ordem de data
appointmentSchema.index({ dateTime: 1 }); // Para buscar consultas por data

// Método para verificar se o horário está disponível para o médico
appointmentSchema.statics.checkAvailability = async function(doctorId, dateTime, duration, excludeId = null) {
  const startTime = new Date(dateTime);
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  const query = {
    doctor: doctorId,
    status: { $ne: 'cancelada' },
    $or: [
      // Consulta começa durante outra consulta
      { 
        dateTime: { $lt: endTime },
        $expr: { 
          $gt: [{ $add: ["$dateTime", { $multiply: ["$duration", 60000] }] }, startTime] 
        }
      }
    ]
  };
  
  // Exclui o próprio agendamento em caso de atualização
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflictingAppointment = await this.findOne(query);
  return !conflictingAppointment;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;