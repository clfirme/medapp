"use client"
import Link from "next/link";
import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function PrescriptionCreate() {
  const router = useRouter();

  // Estados para armazenar dados dos selects
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Referências aos modelos relacionados
  const [doctorId, setDoctorId] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  
  // Datas
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState<string>('');
  
  // Medicamentos (array de objetos)
  const [medications, setMedications] = useState<any[]>([{
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    controlled: false
  }]);
  
  // Outras informações
  const [generalInstructions, setGeneralInstructions] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [icdCode, setIcdCode] = useState<string>('');
  const [status, setStatus] = useState<string>('ativa');
  
  // Novo estado para controlar o alerta de sucesso
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Informações de refil
  const [isRefillable, setIsRefillable] = useState<boolean>(false);
  const [refillsAuthorized, setRefillsAuthorized] = useState<string>('0');
  
  // Token e erro
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Opções para status
  const statusOptions = ['ativa', 'dispensada', 'cancelada', 'expirada'];

  useEffect(() => {
    // Recuperar token de autenticação
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      
      // Carregar médicos, pacientes e consultas do backend
      fetchDoctors(storedToken);
      fetchPatients(storedToken);
      fetchAppointments(storedToken);
    }
    
    // Calcular data de expiração padrão (30 dias após a emissão)
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);
    setExpirationDate(defaultExpiration.toISOString().split('T')[0]);
    
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

  const fetchAppointments = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3001/appointments', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Erro ao buscar consultas:', err);
    }
  };

  // Funções para gerenciar medicamentos
  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      controlled: false
    }]);
  };

  const removeMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  const updateMedication = (index: number, field: string, value: any) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setMedications(updatedMedications);
  };

  // Função para limpar o formulário
  const resetForm = () => {
    // Mantém o médico e a data de emissão
    // setDoctorId('');
    setPatientId('');
    setAppointmentId('');
    
    // Reinicia os medicamentos
    setMedications([{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      controlled: false
    }]);
    
    // Reseta as outras informações
    setGeneralInstructions('');
    setDiagnosis('');
    setIcdCode('');
    setStatus('ativa');
    setIsRefillable(false);
    setRefillsAuthorized('0');
    
    // Recalcula a data de expiração padrão
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);
    setExpirationDate(defaultExpiration.toISOString().split('T')[0]);
  };

  // Funções para navegação após sucesso
  const handleAddAnother = () => {
    setSuccess(false);
    // O formulário já está limpo, apenas esconde o alerta
  };

  const handleBackToMenu = () => {
    router.push('/home');
  };

  // Função para criar a prescrição
  const createPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    // Validação dos campos obrigatórios
    if (!doctorId || !patientId || !issueDate) {
      setError("Médico, paciente e data de emissão são obrigatórios");
      return;
    }
    
    // Validar medicamentos
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      if (!med.name || !med.dosage || !med.frequency) {
        setError(`Preencha nome, dosagem e frequência para todos os medicamentos`);
        return;
      }
    }
    
    // Validar data de expiração
    if (expirationDate && new Date(expirationDate) <= new Date(issueDate)) {
      setError("A data de validade deve ser posterior à data de emissão");
      return;
    }
    
    // Estruturar os dados conforme esperado pelo modelo
    const formData = {
      doctor: doctorId,
      pacient: patientId,
      appointment: appointmentId || undefined,
      issueDate: new Date(issueDate),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      medications,
      generalInstructions: generalInstructions || undefined,
      diagnosis: diagnosis || undefined,
      icdCode: icdCode || undefined,
      status,
      refillInfo: {
        isRefillable,
        refillsAuthorized: isRefillable ? parseInt(refillsAuthorized) : 0,
        refillsUsed: 0
      }
    };
    
    try {
      const response = await fetch('http://localhost:3001/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao cadastrar prescrição');
      }
      // Buscar nome do paciente para mensagem de sucesso
      const patientName = patients.find(p => p._id === patientId)?.name || 'Paciente';
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      setSuccessMessage(`Prescrição para ${patientName} criada com sucesso!`);
      
      // Limpar o formulário para permitir uma nova prescrição
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar prescrição');
    }
  };

  if (loading) {
    return <div style={{ marginLeft: '30px' }}>Carregando...</div>;
  }

  return (
    <div style={{ marginLeft: '30px', maxWidth: '800px' }}>
      <h1>Nova Prescrição Médica</h1>
      
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
              Criar outra prescrição
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
        <form onSubmit={createPrescription}>
          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações Básicas</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="doctor" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Médico Responsável: *
            </label>
            <select
              id="doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
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
                  {doctor.name} - CRM: {doctor.crm}
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
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
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
                  {patient.name} - CPF: {patient.cpf}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="appointment" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Consulta Relacionada:
            </label>
            <select
              id="appointment"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">Selecione uma consulta (opcional)</option>
              {appointments.map(appointment => (
                <option key={appointment._id} value={appointment._id}>
                  {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="issueDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Data de Emissão: *
              </label>
              <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div style={{ flex: '1' }}>
              <label htmlFor="expirationDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Data de Validade: *
              </label>
              <input
                type="date"
                id="expirationDate"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                required
                min={new Date(issueDate).toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Status da Prescrição:
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

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Diagnóstico</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="diagnosis" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Diagnóstico:
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
              placeholder="Diagnóstico do paciente"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="icdCode" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Código CID:
            </label>
            <input
              type="text"
              id="icdCode"
              value={icdCode}
              onChange={(e) => setIcdCode(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="Ex: J11, E10.9"
            />
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Medicamentos</h2>
          
          {medications.map((medication, index) => (
            <div key={index} style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Medicamento {index + 1}</h3>
                {medications.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMedication(index)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor={`med-name-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome do Medicamento: *
                </label>
                <input
                  type="text"
                  id={`med-name-${index}`}
                  value={medication.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: '1' }}>
                  <label htmlFor={`med-dosage-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Dosagem: *
                  </label>
                  <input
                    type="text"
                    id={`med-dosage-${index}`}
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                    placeholder="Ex: 500mg, 10ml"
                    required
                  />
                </div>
                
                <div style={{ flex: '1' }}>
                  <label htmlFor={`med-frequency-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Frequência: *
                  </label>
                  <input
                    type="text"
                    id={`med-frequency-${index}`}
                    value={medication.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                    placeholder="Ex: 8/8h, 1x ao dia"
                    required
                  />
                </div>
                
                <div style={{ flex: '1' }}>
                  <label htmlFor={`med-duration-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Duração:
                  </label>
                  <input
                    type="text"
                    id={`med-duration-${index}`}
                    value={medication.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                    placeholder="Ex: 7 dias, 2 semanas"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor={`med-instructions-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Instruções especiais:
                </label>
                <textarea
                  id={`med-instructions-${index}`}
                  value={medication.instructions}
                  onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    minHeight: '60px'
                  }}
                  placeholder="Instruções adicionais sobre a administração"
                />
              </div>
              
              <div style={{ marginBottom: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={medication.controlled}
                    onChange={(e) => updateMedication(index, 'controlled', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Medicamento controlado</span>
                </label>
              </div>
            </div>
          ))}
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={addMedication}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Adicionar Medicamento
            </button>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Instruções Gerais</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="generalInstructions" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Instruções para o Paciente:
            </label>
            <textarea
              id="generalInstructions"
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '100px'
              }}
              placeholder="Instruções gerais para o paciente"
            />
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações de Refil</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={isRefillable}
                onChange={(e) => setIsRefillable(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Permitir refil da prescrição</span>
            </label>
            
            {isRefillable && (
              <div style={{ marginLeft: '20px' }}>
                <label htmlFor="refillsAuthorized" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Número de refis autorizados:
                </label>
                <input
                  type="number"
                  id="refillsAuthorized"
                  value={refillsAuthorized}
                  onChange={(e) => setRefillsAuthorized(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  min="1"
                  max="12"
                />
              </div>
            )}
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
              Criar Prescrição
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
