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
        setVerified(true)
      }
    }, []);

    if (!verified) {
      return null;
    }
    return <Component {...props} />;
  };
}
