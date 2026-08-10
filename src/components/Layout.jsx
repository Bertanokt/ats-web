import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { kullanici, cikisYap } = useAuth();
    const navigate = useNavigate();

    const linkStil = ({ isActive }) =>
        isActive
            ? 'px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white'
            : 'px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900';

    function cikis() {
        cikisYap();
        navigate('/giris');
    }

    const rolAdi = kullanici?.rol === 'ADMIN' ? 'Yönetici' : 'İK Uzmanı';

    const basHarfler = (kullanici?.adSoyad || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
                <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1">
                    <div className="flex items-center gap-2 mr-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            A
                        </span>
                        <span className="font-semibold text-slate-900">ATS</span>
                    </div>

                    <NavLink to="/ilanlar" className={linkStil}>İlanlar</NavLink>
                    <NavLink to="/adaylar" className={linkStil}>Adaylar</NavLink>
                    <NavLink to="/basvurular" className={linkStil}>Başvurular</NavLink>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden sm:block text-right leading-tight">
                            <div className="text-sm font-medium text-slate-900">
                                {kullanici?.adSoyad}
                            </div>
                            <div className="text-xs text-slate-500">{rolAdi}</div>
                        </div>
                        <span
                            title={kullanici?.adSoyad}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
                        >
                            {basHarfler}
                        </span>
                        <button
                            onClick={cikis}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            Çıkış
                        </button>
                    </div>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
