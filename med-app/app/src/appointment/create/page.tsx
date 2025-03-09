"use client"
import Link from "next/link";
import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function AppointmentCreate() {
  const router = useRouter();

  // Estados para armazenar dados dos selects
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // Novo estado para controlar o alerta de sucesso
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Referências aos modelos relacionados
  const [doctorID, setDoctorID] = useState<string>('');
  const [pacientID, setPacientID] = useState<string>('');
  
  // Data e hora da consulta
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  
  // Informações adicionais da consulta
  const [duration, setDuration] = useState<string>('30');
  const [status, setStatus] = useState<string>('agendada');
  const [type, setType] = useState<string>('primeira consulta');
  const [notes, setNotes] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  
  // Informações de pagamento
  const [paymentStatus, setPaymentStatus] = useState<string>('pendente');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  
  // Token e erro
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Opções para os selects
  const statusOptions = ['agendada', 'confirmada', 'realizada', 'cancelada'];
  const typeOptions = ['primeira consulta', 'retorno', 'emergência'];
  const paymentStatusOptions = ['pendente', 'pago', 'reembolsado'];
  const paymentMethodOptions = ['dinheiro', 'cartão', 'convênio', 'pix', 'outro'];

  useEffect(() => {
    // Recuperar token de autenticação
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      
      // Carregar médicos e pacientes do backend
      fetchDoctors(storedToken);
      fetchPatients(storedToken);
    }
    
    // Definir data mínima como o dia atual
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setLoading(false);
  }, []);

  // Funções para buscar dados do backend
  const fetchDoctors = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3001/doctors', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Erro ao buscar médicos:', err);
    }
  };

  const fetchPatients = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3001/patients', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    }
  };

  // Função para limpar o formulário
  const resetForm = () => {
    setDoctorID('');
    setPacientID('');
    setAppointmentDate('');
    setAppointmentTime('');
    setDuration('30');
    setStatus('agendada');
    setType('primeira consulta');
    setNotes('');
    setSymptoms('');
    setDiagnosis('');
    setPaymentStatus('pendente');
    setPaymentMethod('');
    setPaymentAmount('');
  };

  // Funções para navegação após sucesso
  const handleAddAnother = () => {
    setSuccess(false);
    // O formulário já está limpo, apenas esconde o alerta
  };

  const handleBackToMenu = () => {
    router.push('/home');
  };

  // Função para criar a consulta
  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    // Validação dos campos obrigatórios
    if (!doctorID || !pacientID || !appointmentDate || !appointmentTime) {
      setError("Médico, paciente, data e hora são obrigatórios");
      return;
    }
    
    // Validar se a data/hora é futura
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      setError("A data e hora da consulta devem ser no futuro");
      return;
    }
    
    // Validar duração
    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue < 15 || durationValue > 120) {
      setError("A duração deve estar entre 15 e 120 minutos");
      return;
    }
    
    // Preparar array de sintomas
    const symptomsArray = symptoms 
      ? symptoms.split(',').map(symptom => symptom.trim()).filter(symptom => symptom)
      : [];
    
    // Estruturar os dados conforme esperado pelo modelo
    const formData = {
      doctorID,
      pacientID,
      dateTime: appointmentDateTime,
      duration: durationValue,
      status,
      type,
      notes: notes || undefined,
      symptoms: symptomsArray,
      diagnosis: diagnosis || undefined,
      payment: {
        status: paymentStatus,
        method: paymentMethod || undefined,
        amount: paymentAmount ? parseFloat(paymentAmount) : undefined
      }
    };
    
    try {
      // Verificar disponibilidade do médico antes de agendar
      const availabilityResponse = await fetch(`http://localhost:3001/checkAvailability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          doctorID,
          dateTime: appointmentDateTime,
          duration: durationValue
        })
      });
      
      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(errorData.message || 'O médico não está disponível neste horário');
      }
      
      // Criar a consulta
      const response = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao agendar consulta');
      }
      
      // Buscar nome do paciente para mensagem de sucesso
      const patientName = patients.find(p => p._id === pacientID)?.name || 'Paciente';
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      setSuccessMessage(`Consulta para ${patientName} agendada com sucesso!`);
      
      // Limpar o formulário para permitir um novo agendamento
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar consulta');
    }
  };

  if (loading) {
    return <div style={{ marginLeft: '30px' }}>Carregando...</div>;
  }

  return (
    <div style={{ marginLeft: '30px', maxWidth: '800px' }}>
      <h1>Agendar Nova Consulta</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      {/* Alerta de sucesso */}
      {success && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <p>{successMessage}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleAddAnother}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Agendar outra consulta
            </button>
            <button
              onClick={handleBackToMenu}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Voltar ao menu principal
            </button>
          </div>
        </div>
      )}
      
      {/* Se o formulário foi enviado com sucesso, oculta-o */}
      {!success && (
        <form onSubmit={createAppointment}>
          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações Básicas</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="doctor" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Médico: *
            </label>
            <select
              id="doctor"
              value={doctorID}
              onChange={(e) => setDoctorID(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
            >
              <option value="">Selecione um médico</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="patient" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Paciente: *
            </label>
            <select
              id="patient"
              value={pacientID}
              onChange={(e) => setPacientID(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
            >
              <option value="">Selecione um paciente</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.cpf}
                </option>
              ))}
            </select>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Data e Hora</h2>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="appointmentDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Data da Consulta: *
              </label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="appointmentTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Horário: *
              </label>
              <input
                type="time"
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                required
              />
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="duration" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Duração (minutos): *
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                min="15"
                max="120"
                step="5"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="type" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tipo de Consulta:
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                {typeOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Status:
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações Clínicas</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="symptoms" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sintomas Relatados:
            </label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '60px'
              }}
              placeholder="Separe os sintomas por vírgulas (ex: dor de cabeça, febre, tosse)"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="diagnosis" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Diagnóstico (pré-consulta):
            </label>
            <textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '60px'
              }}
              placeholder="Hipótese diagnóstica inicial, se houver"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Observações:
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '60px'
              }}
              placeholder="Informações adicionais importantes sobre a consulta"
              maxLength={1000}
            />
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações de Pagamento</h2>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="paymentStatus" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Status do Pagamento:
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                {paymentStatusOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Método de Pagamento:
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Selecione um método</option>
                {paymentMethodOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="paymentAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Valor (R$):
              </label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Agendar Consulta
            </button>
            
            <Link href="/home" 
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                padding: '10px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
