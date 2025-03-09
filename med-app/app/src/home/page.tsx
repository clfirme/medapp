"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [doctorId, setDoctorId] = useState<string>('');
  
  useEffect(() => {
    // Verificar se há token
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push('/');
      return;
    }
    
    // Determinar se é admin ou médico regular
    const userType = sessionStorage.getItem("userType") || '';
    setIsAdmin(userType === 'admin');
    setDoctorId(sessionStorage.getItem("doctorId") || '');
    
    // Obter informações do médico logado
    const fetchDoctorInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/doctors/me', {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) {
          sessionStorage.removeItem("token");
          router.push('/');
          return;
        }
        
        const data = await response.json();
        setDoctorName(data.name);
      } catch (error) {
        console.error('Erro ao obter informações do médico:', error);
      }
    };
    
    fetchDoctorInfo();
  }, [router]);
  
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userType");
    sessionStorage.removeItem("doctorId");
    router.push('/');
  };
  
  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>MedApp - Sistema de Gestão Médica</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Olá, {doctorName}</span>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {isAdmin && (
          <Link href="/src/doctor/create" 
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👨‍⚕️</div>
            <div>Cadastrar Médico</div>
          </Link>
        )}
        
        <Link href="/src/pacient/create" 
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>👨‍👩‍👧‍👦</div>
          <div>Cadastrar Paciente</div>
        </Link>
        
        <Link href="/src/appointment/create" 
          style={{
            backgroundColor: '#ff9800',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📅</div>
          <div>Agendar Consulta</div>
        </Link>
        
        <Link href="/src/prescription/create" 
          style={{
            backgroundColor: '#9c27b0',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
          <div>Nova Prescrição</div>
        </Link>
        
        <Link href="/src/list" 
          style={{
            backgroundColor: '#26a69a',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔍</div>
          <div>Meus Pacientes</div>
        </Link>
      </div>
    </div>
  );
}
