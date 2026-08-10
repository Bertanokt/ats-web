import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function KorumaliRota({ children }) {
    const { girisYapildiMi, yukleniyor } = useAuth();

    if (yukleniyor) {
        return <div className="p-8 text-gray-500">Yükleniyor...</div>;
    }

    if (!girisYapildiMi) {
        return <Navigate to="/giris" replace />;
    }

    return children;
}