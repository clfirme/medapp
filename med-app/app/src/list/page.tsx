"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Pacient {
  _id: string;
  name: string;
  cpf: string;
  birthDate: string;
  gender: string;
  doctorID: string;
  // Outros campos podem ser adicionados conforme necessário
}

export default function PacientList() {
  const router = useRouter();
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [doctorId, setDoctorId] = useState<string>('');
  
  // Estado para mensagem de sucesso
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    // Recuperar token de autenticação e verificar se é admin
    const storedToken = sessionStorage.getItem("token");
    const storedIsAdmin = sessionStorage.getItem("isAdmin") === 'true';
    const storedDoctorId = sessionStorage.getItem("doctorId");
    
    if (storedToken) {
      setToken(storedToken);
      setIsAdmin(storedIsAdmin);
      if (storedDoctorId) {
        setDoctorId(storedDoctorId);
      }
      
      // Carregar pacientes
      fetchPacients(storedToken, storedIsAdmin, storedDoctorId || '');
    } else {
      // Redirecionar para a página de login se não houver token
      router.push('/');
    }
  }, [router]);

  const fetchPacients = async (authToken: string, isAdminUser: boolean, doctorID: string) => {
    try {
      setLoading(true);
      
      // URL para buscar pacientes (diferentes para admin e médico)
      const url = isAdminUser 
        ? 'http://localhost:3001/pacients' 
        : `http://localhost:3001/pacients/doctor/${doctorID}`;
      
      // Adicionar timestamp para evitar cache
      const nocacheUrl = `${url}?timestamp=${new Date().getTime()}`;
      
      const response = await fetch(nocacheUrl, {
        headers: {
          'Authorization': authToken,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pacientes');
      }
      
      const data = await response.json();
      console.log("Pacientes carregados:", data.length);
      setPacients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePacient = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o paciente ${name}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/pacients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir paciente');
      }
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      setSuccessMessage(`Paciente ${name} excluído com sucesso!`);
      
      // Remover imediatamente o paciente da lista local
      setPacients(prevPacients => prevPacients.filter(p => p._id !== id));
      
      // Após 2 segundos, ocultar a mensagem e recarregar dados do servidor
      setTimeout(() => {
        setSuccess(false);
        // Recarregar a lista de pacientes do servidor
        fetchPacients(token, isAdmin, doctorId);
        
        // Solução alternativa: forçar atualização da página se necessário
        if (pacients.some(p => p._id === id)) {
          console.log("Forçando reload da página");
          window.location.reload();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir paciente');
    }
  };

  if (loading) {
    return <div style={{ marginLeft: '30px' }}>Carregando...</div>;
  }

  return (
    <div style={{ marginLeft: '30px', maxWidth: '800px' }}>
      <h1>Meus Pacientes</h1>
      
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
      
      {/* Mensagem de sucesso */}
      {success && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p>{successMessage}</p>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <Link href="/src/pacient/create" 
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          + Novo Paciente
        </Link>
      </div>
      
      {pacients.length === 0 ? (
        <p>Nenhum paciente encontrado.</p>
      ) : (
        <div>
          <p>Total de pacientes: {pacients.length}</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Nome</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>CPF</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Data de Nascimento</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacients.map((pacient) => (
                <tr key={pacient._id}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{pacient.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    {pacient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    {new Date(pacient.birthDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <Link href={`/src/pacient/edit/${pacient._id}`}
                        style={{
                          backgroundColor: '#1976d2',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => deletePacient(pacient._id, pacient.name)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
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
          Voltar ao Menu
        </Link>
      </div>
    </div>
  );
}
