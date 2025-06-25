
//### 📄 `pages/index.js`

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.replace('/clubs');
  }, []);

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center px-6">
      <div className="text-center text-white space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">Cancheal App</h1>
        <p className="text-lg md:text-xl opacity-90">Reservá tu cancha fácil y rápido desde cualquier lugar</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-600 font-semibold px-6 py-2 rounded shadow hover:bg-gray-100 transition"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-transparent border border-white text-white px-6 py-2 rounded hover:bg-white hover:text-blue-600 transition"
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}