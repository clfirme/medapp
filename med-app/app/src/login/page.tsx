"use client"
import React, {useState} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [crm, setCrm] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string|null>('');
  const [userType, setUserType] = useState<string>('admin'); // 'admin' ou 'doctor'

  const authentication = async (e:any) => {
    e.preventDefault();
    setError(null);

    if (crm != "" && password != ""){
      const formData = {
        crm: crm,
        password: password,
        isAdmin: userType === 'admin' // Indicação se é login como admin ou médico
      }

      try {
        // URL de acordo com o tipo de usuário
        const loginUrl = userType === 'admin' 
          ? 'http://localhost:3001/doctors/login-admin'
          : 'http://localhost:3001/doctors/login-doctor';
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha no login');
        }

        const content = await response.json();
        if (content.token) {
          // Armazenar o token e tipo de usuário
          sessionStorage.setItem("token", content.token);
          sessionStorage.setItem("userType", userType);
          sessionStorage.setItem("doctorId", content.doctor.id);
          
          // Modificado para navegar para o caminho correto
          router.push('/src/home');
          
          // Alternativa com redirecionamento completo caso a navegação falhe
          setTimeout(() => {
            if (window.location.pathname !== '/src/home') {
              console.log('Navegação via router falhou, usando redirecionamento alternativo');
              window.location.href = '/src/home';
            }
          }, 1000);
        } else {
          setError('Token não recebido do servidor');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro durante a autenticação');
      }
    } else {
      setError("CRM e senha são obrigatórios");
    }
  }

  return(
    <div style={{ marginLeft: '30px' }}>
      <form className='w-full' onSubmit={authentication}>
        <span className='font-bold text-blue-500 py-2 block text-2xl'>Login</span>
        
        <div className='w-full py-2'>
          <div className='flex space-x-4 mb-4'>
            <div className='flex items-center'>
              <input 
                type="radio" 
                id="admin-login" 
                name="user-type" 
                value="admin"
                checked={userType === 'admin'}
                onChange={() => setUserType('admin')}
                className="mr-2"
              />
              <label htmlFor="admin-login">Administrador</label>
            </div>
            <div className='flex items-center'>
              <input 
                type="radio" 
                id="doctor-login" 
                name="user-type" 
                value="doctor"
                checked={userType === 'doctor'}
                onChange={() => setUserType('doctor')}
                className="mr-2"
              />
              <label htmlFor="doctor-login">Médico</label>
            </div>
          </div>
        </div>
        
        <div className='w-full py-2'>
          <label htmlFor=""  className='text-sm font-bold py-2 block'>CRM</label>
          <input type='text' name='crm' className='w-full border-2 border-gray-200 p-2 rounded-sm' onChange={(e:any)=>setCrm(e.target.value)}/>
        </div>
        <div className='w-full py-2'>
          <label htmlFor="" className='text-sm font-bold py-2 block'>Senha</label>
          <input name="password" type="password" className='w-full border-2 border-gray-200 p-2 rounded-sm' onChange={(e:any)=>setPassword(e.target.value)}/>
        </div>
        <div className='w-full py-2'>
          <button className='w-20 p-2 text-white border-gray-200 border-2 rounded-sm bg-green-400'>Login</button>
        </div>
        <div>
          {error && <div className="p-2 text-white border-gray-200 border-2 rounded-sm bg-red-400">{error}</div>}
        </div>
      </form>
    </div>
  )
}
