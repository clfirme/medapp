"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PacientEdit({ params }: PageProps) {
  const router = useRouter();
  const pacientId = params.id;

  // Informações básicas
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<string>('prefiro não informar');
  
  // Informações de contato
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Estado adicional para o ID do médico
  const [doctorId, setDoctorId] = useState<string>('');

  // Novo estado para controlar o alerta de sucesso
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Contato de emergência
  const [emergencyName, setEmergencyName] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [emergencyRelationship, setEmergencyRelationship] = useState<string>('');
  
  // Endereço
  const [street, setStreet] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [complement, setComplement] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  
  // Informações de saúde
  const [bloodType, setBloodType] = useState<string>('desconhecido');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  
  // Condições médicas, alergias etc.
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  
  // Plano de saúde
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  const [insurancePlanType, setInsurancePlanType] = useState<string>('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState<string>('');
  const [insuranceExpirationDate, setInsuranceExpirationDate] = useState<string>('');
  
  // Preferências
  const [communicationPreference, setCommunicationPreference] = useState<string>('whatsapp');
  const [dataSharing, setDataSharing] = useState<boolean>(false);
  const [researchParticipation, setResearchParticipation] = useState<boolean>(false);
  
  // Notas
  const [notes, setNotes] = useState<string>('');
  
  // Autenticação e estado
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Opções para selects
  const genderOptions = ['masculino', 'feminino', 'outro', 'prefiro não informar'];
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconhecido'];
  const communicationOptions = ['email', 'sms', 'whatsapp', 'telefone'];

  // Carregar token de autenticação e dados do paciente
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    
    if (storedToken) {
      setToken(storedToken);
      fetchPacientData(storedToken);
    } else {
      // Redirecionar para a página de login se não houver token
      router.push('/');
    }
  }, [router, pacientId]);

  // Função para buscar os dados do paciente
  const fetchPacientData = async (authToken: string) => {
    try {
      const response = await fetch(`http://localhost:3001/pacients/${pacientId}`, {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do paciente');
      }
      
      const pacientData = await response.json();
      
      // Preencher o formulário com os dados do paciente
      setName(pacientData.name || '');
      setCpf(formatCPF(pacientData.cpf) || '');
      setBirthDate(pacientData.birthDate ? new Date(pacientData.birthDate).toISOString().split('T')[0] : '');
      setGender(pacientData.gender || 'prefiro não informar');
      setDoctorId(pacientData.doctorID || '');
      
      // Contato
      if (pacientData.contact) {
        setEmail(pacientData.contact.email || '');
        setPhone(pacientData.contact.phone || '');
        
        // Contato de emergência
        if (pacientData.contact.emergencyContact) {
          setEmergencyName(pacientData.contact.emergencyContact.name || '');
          setEmergencyPhone(pacientData.contact.emergencyContact.phone || '');
          setEmergencyRelationship(pacientData.contact.emergencyContact.relationship || '');
        }
        
        // Endereço
        if (pacientData.contact.address) {
          setStreet(pacientData.contact.address.street || '');
          setNumber(pacientData.contact.address.number || '');
          setComplement(pacientData.contact.address.complement || '');
          setNeighborhood(pacientData.contact.address.neighborhood || '');
          setCity(pacientData.contact.address.city || '');
          setState(pacientData.contact.address.state || '');
          setZipCode(pacientData.contact.address.zipCode || '');
        }
      }
      
      // Informações de saúde
      if (pacientData.healthInfo) {
        setBloodType(pacientData.healthInfo.bloodType || 'desconhecido');
        setWeight(pacientData.healthInfo.weight?.toString() || '');
        setHeight(pacientData.healthInfo.height?.toString() || '');
        
        // Condições médicas e alergias (arrays para string)
        setMedicalConditions(Array.isArray(pacientData.healthInfo.medicalConditions) 
          ? pacientData.healthInfo.medicalConditions.join(', ') 
          : '');
          
        setAllergies(Array.isArray(pacientData.healthInfo.allergies) 
          ? pacientData.healthInfo.allergies.join(', ') 
          : '');
      }
      
      // Informações do plano de saúde
      if (pacientData.insuranceInfo) {
        setInsuranceProvider(pacientData.insuranceInfo.provider || '');
        setInsurancePlanType(pacientData.insuranceInfo.planType || '');
        setInsurancePolicyNumber(pacientData.insuranceInfo.policyNumber || '');
        setInsuranceExpirationDate(pacientData.insuranceInfo.expirationDate 
          ? new Date(pacientData.insuranceInfo.expirationDate).toISOString().split('T')[0] 
          : '');
      }
      
      // Preferências
      if (pacientData.preferences) {
        setCommunicationPreference(pacientData.preferences.communicationPreference || 'whatsapp');
        setDataSharing(pacientData.preferences.dataSharing || false);
        setResearchParticipation(pacientData.preferences.researchParticipation || false);
      }
      
      // Notas
      setNotes(pacientData.notes || '');
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  // Função para formatar o CPF durante a digitação
  const formatCPF = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedValue = numericValue.slice(0, 11);
    
    // Aplica a formatação: 123.456.789-01
    if (limitedValue.length <= 3) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3)}`;
    } else if (limitedValue.length <= 9) {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6)}`;
    } else {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6, 9)}-${limitedValue.slice(9)}`;
    }
  };

  // Função para validar CPF
  const validateCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    const numericCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numericCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais, o que é inválido
    if (/^(\d)\1+$/.test(numericCPF)) return false;
    
    return true;
  };

  // Função para atualizar paciente
  const updatePacient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    // Validação dos campos obrigatórios
    if (!name || !cpf || !birthDate || !phone) {
      setError("Os campos nome, CPF, data de nascimento e telefone são obrigatórios");
      return;
    }
    
    // Validação do CPF
    if (!validateCPF(cpf)) {
      setError("Por favor, insira um CPF válido");
      return;
    }
    
    // Validação da data de nascimento
    const selectedDate = new Date(birthDate);
    const today = new Date();
    if (selectedDate > today) {
      setError("A data de nascimento não pode ser no futuro");
      return;
    }
    
    // Validação de e-mail (se preenchido)
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        setError("Por favor, insira um e-mail válido");
        return;
      }
    }
  
    // Estruturar os dados conforme esperado pelo modelo
    const formData = {
      name,
      cpf: cpf.replace(/\D/g, ''),  // Remove formatação
      birthDate: selectedDate,
      gender,
      doctorID: doctorId,
      contact: {
        email: email || undefined,  // Não enviar se estiver vazio
        phone,
        emergencyContact: emergencyName ? {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship
        } : undefined,
        address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zipCode
        }
      },
      healthInfo: {
        bloodType,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        medicalConditions: medicalConditions ? medicalConditions.split(',').map(item => item.trim()) : [],
        allergies: allergies ? allergies.split(',').map(item => item.trim()) : []
      },
      insuranceInfo: insuranceProvider ? {
        provider: insuranceProvider,
        planType: insurancePlanType,
        policyNumber: insurancePolicyNumber,
        expirationDate: insuranceExpirationDate ? new Date(insuranceExpirationDate) : undefined
      } : undefined,
      notes,
      preferences: {
        communicationPreference,
        dataSharing,
        researchParticipation
      },
      active: true
    };
    
    try {
      const response = await fetch(`http://localhost:3001/pacients/${pacientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar paciente');
      }
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      setSuccessMessage(`Paciente ${name} atualizado com sucesso!`);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/pacients');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar paciente');
    }
  };

  if (loading) {
    return <div style={{ marginLeft: '30px' }}>Carregando...</div>;
  }

  return (
    <div style={{ marginLeft: '30px', maxWidth: '600px' }}>
      <h1>Editar Paciente</h1>
      
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
          marginBottom: '20px'
        }}>
          <p>{successMessage}</p>
          <p>Redirecionando para a lista de pacientes...</p>
        </div>
      )}
      
      {!success && (
        <form onSubmit={updatePacient}>
          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações Básicas</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nome completo: *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="cpf" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              CPF: *
            </label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
              placeholder="123.456.789-01"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="birthDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Data de Nascimento: *
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Gênero:
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {genderOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações de Contato</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Telefone: *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <h3 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>Contato de Emergência</h3>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="emergencyName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nome:
            </label>
            <input
              type="text"
              id="emergencyName"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="emergencyPhone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Telefone:
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="emergencyRelationship" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Relação:
            </label>
            <input
              type="text"
              id="emergencyRelationship"
              value={emergencyRelationship}
              onChange={(e) => setEmergencyRelationship(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="Ex: Cônjuge, Filho(a), Amigo(a)"
            />
          </div>

          <h3 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>Endereço</h3>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="street" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Rua:
            </label>
            <input
              type="text"
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '0 0 30%' }}>
              <label htmlFor="number" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Número:
              </label>
              <input
                type="text"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div style={{ flex: '1' }}>
              <label htmlFor="complement" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Complemento:
              </label>
              <input
                type="text"
                id="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="neighborhood" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Bairro:
            </label>
            <input
              type="text"
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="city" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cidade:
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div style={{ flex: '0 0 20%' }}>
              <label htmlFor="state" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Estado:
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                maxLength={2}
                placeholder="UF"
              />
            </div>
            <div style={{ flex: '0 0 35%' }}>
              <label htmlFor="zipCode" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                CEP:
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                placeholder="00000-000"
              />
            </div>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações de Saúde</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="bloodType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tipo Sanguíneo:
            </label>
            <select
              id="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {bloodTypeOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'desconhecido' ? 'Desconhecido' : option}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '1' }}>
              <label htmlFor="weight" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Peso (kg):
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                step="0.1"
                min="0"
              />
            </div>
            <div style={{ flex: '1' }}>
              <label htmlFor="height" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Altura (cm):
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                step="1"
                min="0"
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="medicalConditions" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Condições Médicas:
            </label>
            <textarea
              id="medicalConditions"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '60px'
              }}
              placeholder="Separe as condições por vírgulas (ex: Diabetes, Hipertensão)"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="allergies" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Alergias:
            </label>
            <textarea
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '60px'
              }}
              placeholder="Separe as alergias por vírgulas (ex: Penicilina, Látex)"
            />
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Plano de Saúde</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="insuranceProvider" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Convênio:
            </label>
            <input
              type="text"
              id="insuranceProvider"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="insurancePlanType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tipo de Plano:
            </label>
            <input
              type="text"
              id="insurancePlanType"
              value={insurancePlanType}
              onChange={(e) => setInsurancePlanType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="insurancePolicyNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Número da Apólice/Carteirinha:
            </label>
            <input
              type="text"
              id="insurancePolicyNumber"
              value={insurancePolicyNumber}
              onChange={(e) => setInsurancePolicyNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="insuranceExpirationDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Data de Validade:
            </label>
            <input
              type="date"
              id="insuranceExpirationDate"
              value={insuranceExpirationDate}
              onChange={(e) => setInsuranceExpirationDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Preferências e Consentimentos</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="communicationPreference" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Preferência de Comunicação:
            </label>
            <select
              id="communicationPreference"
              value={communicationPreference}
              onChange={(e) => setCommunicationPreference(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {communicationOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dataSharing}
                onChange={(e) => setDataSharing(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Autorizo o compartilhamento de dados com outros profissionais de saúde</span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={researchParticipation}
                onChange={(e) => setResearchParticipation(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Tenho interesse em participar de pesquisas clínicas</span>
            </label>
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
                minHeight: '80px'
              }}
              placeholder="Informações adicionais relevantes sobre o paciente"
            />
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
              Salvar Alterações
            </button>
            
            <Link href="/pacients" 
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
