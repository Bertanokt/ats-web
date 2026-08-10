import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Giris() {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [hata, setHata] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(false);

    const { girisYap } = useAuth();
    const navigate = useNavigate();

    async function gonder(e) {
        e.preventDefault();
        setHata(null);
        setYukleniyor(true);

        try {
            const cevap = await api.post('/api/auth/login', { email, sifre });
            girisYap(cevap);
            navigate('/ilanlar');
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    function demoDoldur(demoEmail) {
        setEmail(demoEmail);
        setSifre('demo1234');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <div className="text-center mb-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white text-xl font-bold shadow-lg shadow-blue-600/25">
                        ATS
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mt-4">İşe Alım Takip Sistemi</h1>
                    <p className="text-slate-500 text-sm mt-1">Devam etmek için giriş yapın</p>
                </div>

                <form
                    onSubmit={gonder}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
                >
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                            E-posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            placeholder="ornek@ats.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="sifre" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Şifre
                        </label>
                        <input
                            id="sifre"
                            type="password"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            placeholder="••••••••"
                        />
                    </div>

                    {hata && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                            {hata}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={yukleniyor}
                        className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş yap'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    <p className="mb-2">Demo hesaplar</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => demoDoldur('admin@ats.com')}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Yönetici
                        </button>
                        <button
                            type="button"
                            onClick={() => demoDoldur('ik@ats.com')}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            İK Uzmanı
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
