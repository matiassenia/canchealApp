//### 📄 `pages/logout.js`
//```jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.replace('/login');
  }, [router]);

  return null;
}
