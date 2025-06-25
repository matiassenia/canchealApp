//### 📄 `components/Navbar.js`
//```jsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link href="/clubs" className="font-bold">CanchealApp</Link>
      <div className="space-x-4">
        <Link href="/my-bookings" className="hover:underline">Mis reservas</Link>
        <Link href="/logout" className="hover:underline">Cerrar sesión</Link>
      </div>
    </nav>
  );
}
