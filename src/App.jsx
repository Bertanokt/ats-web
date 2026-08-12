import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import KorumaliRota from './components/KorumaliRota';
import Giris from './pages/Giris';
import Ilanlar from './pages/Ilanlar';
import Adaylar from './pages/Adaylar';
import Basvurular from './pages/Basvurular';
import BasvuruDetay from './pages/BasvuruDetay';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/giris" element={<Giris />} />

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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}