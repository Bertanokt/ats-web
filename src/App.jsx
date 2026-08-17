import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import KorumaliRota from './components/KorumaliRota';
import Giris from './pages/Giris';
import Ilanlar from './pages/Ilanlar';
import Adaylar from './pages/Adaylar';
import Basvurular from './pages/Basvurular';
import BasvuruDetay from './pages/BasvuruDetay';
import Raporlar from './pages/Raporlar';
import Kariyer from './pages/Kariyer';
import KariyerBasvuru from './pages/KariyerBasvuru';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/giris" element={<Giris />} />

                {/* Public kariyer sayfalari: korumali blogun disinda, giris istemez */}
                <Route path="/kariyer" element={<Kariyer />} />
                <Route path="/kariyer/:ilanId" element={<KariyerBasvuru />} />

                <Route
                    path="/"
                    element={
                        <KorumaliRota>
                            <Layout />
                        </KorumaliRota>
                    }
                >
                    <Route index element={<Navigate to="/ilanlar" replace />} />
                    <Route path="ilanlar" element={<Ilanlar />} />
                    <Route path="adaylar" element={<Adaylar />} />
                    <Route path="basvurular" element={<Basvurular />} />
                    <Route path="basvurular/:id" element={<BasvuruDetay />} />
                    <Route path="raporlar" element={<Raporlar />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}