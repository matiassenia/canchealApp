import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      } else {
        setVerified(true);
      }
    }, [router]);

    if (!verified) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#f6f8f5] px-4">
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-emerald-900">Verificando sesion...</p>
          </div>
        </div>
      );
    }
    return <Component {...props} />;
  };
}
