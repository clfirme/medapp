"use client"
import Link from "next/link";
import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function DoctorCreate() {
  const router = useRouter()

  // Campos básicos
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Novo estado para controlar o alerta de sucesso
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // CRM (campo crm no backend)
  const [crm, setCrm] = useState<string>('');
  
  // Especialidade (campo specialty no backend)
  const [specialty, setSpecialty] = useState<string>('Clínico Geral');
  
  // Campos de contato (aninhados no backend)
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  // Campos de endereço
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  
  // Autenticação
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Lista de especialidades do modelo
  const specialties = [
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
  ];

  // Carregar token de autenticação
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setLoading(false);
    } else {
      // Redirecionar para a página de login se não houver token
      router.push('/');
    }
  }, [router]);

  // Função para limpar o formulário
  const resetForm = () => {
    setName('');
    setPassword('');
    setCrm('');
    setSpecialty('Clínico Geral');
    setEmail('');
    setPhone('');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
  };

  // Funções para navegação
const handleAddAnother = () => {
  setSuccess(false);
  // O formulário já está limpo, apenas esconde o alerta
};

const handleBackToMenu = () => {
  // Modificar para usar o caminho correto
  router.push('/src/home');
  
  // Fallback com redirecionamento caso a navegação falhe
  setTimeout(() => {
    if (window.location.pathname !== '/src/home') {
      window.location.href = '/src/home';
    }
  }, 300);
};

  const addDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    // Validação dos campos obrigatórios
    if (!name || !password || !crm || !specialty || !email || !phone) {
      setError("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }
    
    // Validação do formato CRM
    const crmRegex = /^\d{5,6}(-[A-Z]{2})?$/;
    if (!crmRegex.test(crm)) {
      setError("O CRM deve estar no formato: 12345 ou 12345-UF");
      return;
    }
    
    // Validação de e-mail
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um e-mail válido");
      return;
    }
  
    // Estruturar os dados conforme esperado pelo modelo
    const formData = {
      name,
      password,
      crm,
      specialty,
      contact: {
        email,
        phone,
        address: {
          street,
          city,
          state,
          zipCode
        }
      },
      // Valores padrão para a disponibilidade
      availability: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: "08:00",
        endTime: "18:00",
        appointmentDuration: 30,
        lunchBreak: {
          start: "12:00",
          end: "13:00"
        }
      },
      active: true
    };
    
    try {
      // URL ajustada para corresponder à rota no seu backend
      const response = await fetch('http://localhost:3001/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Falha ao cadastrar médico');
      }
      
      // Mostrar mensagem de sucesso em vez de redirecionar imediatamente
      setSuccess(true);
      setSuccessMessage(`Médico ${name} cadastrado com sucesso!`);
      
      // Limpar o formulário para permitir um novo cadastro
      resetForm();
      
      // Não redirecionar automaticamente
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar médico');
    }
  }

  if (loading) {
    return <div style={{ marginLeft: '30px' }}>Carregando...</div>;
  }

  return (
    <div style={{ marginLeft: '30px', maxWidth: '600px' }}>
      <h1>Cadastro de Médico</h1>
      
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
              Cadastrar outro médico
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
        <form onSubmit={addDoctor}>
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
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Senha: *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
              minLength={8}
              placeholder="Mínimo de 8 caracteres"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="crm" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              CRM: *
            </label>
            <input
              type="text"
              id="crm"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
              placeholder="Exemplo: 12345 ou 12345-SP"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="specialty" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Especialidade médica: *
            </label>
            <select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
            >
              {specialties.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>Informações de Contato</h2>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              E-mail: *
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
              required
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
            />
          </div>

          <h3 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>Endereço (Opcional)</h3>

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

          <div style={{ marginBottom: '15px' }}>
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

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
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
              />
            </div>
            <div style={{ flex: 1 }}>
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
              Cadastrar Médico
            </button>
            
            <Link href="/src/home" 
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
