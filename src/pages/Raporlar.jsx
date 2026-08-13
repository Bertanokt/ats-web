import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Kart from '../components/Kart';
import AsamaDagilimi from '../components/AsamaDagilimi';

export default function Raporlar() {
    const [dagilim, setDagilim] = useState([]);
    const [iseAlinanlar, setIseAlinanlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);
    const [departman, setDepartman] = useState('');

    useEffect(() => {
        getir();
    }, []);

    async function getir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const [d, i] = await Promise.all([
                api.get('/api/basvurular/rapor/funnel'),
                api.get('/api/basvurular/ise-alinanlar'),
            ]);
            setDagilim(d);
            setIseAlinanlar(i);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    if (yukleniyor) {
        return <p className="text-slate-500">Yükleniyor...</p>;
    }

    if (hata) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{hata}</p>
                <button onClick={getir} className="mt-2 text-sm border border-red-300 rounded px-3 py-1 hover:bg-red-100">
                    Tekrar dene
                </button>
            </div>
        );
    }

    const toplam = dagilim.reduce((t, s) => t + s.adet, 0);

    // Departman listesi ise alinanlardan turetiliyor
    const departmanlar = [...new Set(iseAlinanlar.map((k) => k.departman))].sort(
        (a, b) => a.localeCompare(b, 'tr')
    );

    const filtreliIseAlinanlar = departman
        ? iseAlinanlar.filter((k) => k.departman === departman)
        : iseAlinanlar;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Raporlar</h1>

            {/* Asama dagilimi */}
            <Kart>
                <div className="mb-1 flex items-baseline justify-between">
                    <h2 className="font-semibold text-slate-900">Aşama dağılımı</h2>
                    <span className="text-sm text-slate-500">{toplam} başvuru</span>
                </div>
                <p className="mb-5 text-xs text-slate-400">
                    Her aşamada şu an bekleyen başvuru sayısı — birikimli değil.
                </p>

                <AsamaDagilimi dagilim={dagilim} />
            </Kart>

            {/* Ise alinanlar */}
            <div className="bg-white border rounded-lg p-5">
                <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-medium">İşe alınanlar</h2>
                    <span className="text-sm text-slate-500">
                        {departman ? `${filtreliIseAlinanlar.length} / ${iseAlinanlar.length}` : `${iseAlinanlar.length} kişi`}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setDepartman('')}
                        className={`text-sm rounded-full px-3 py-1 border ${
                            departman === ''
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Tümü
                    </button>
                    {departmanlar.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDepartman(d)}
                            className={`text-sm rounded-full px-3 py-1 border ${
                                departman === d
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {filtreliIseAlinanlar.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">
                        Kayıt bulunamadı.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b text-left text-slate-500">
                            <th className="pb-2 font-medium">Aday</th>
                            <th className="pb-2 font-medium">Pozisyon</th>
                            <th className="pb-2 font-medium">Departman</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtreliIseAlinanlar.map((k) => (
                            <tr key={k.id} className="border-b last:border-0">
                                <td className="py-2.5 font-medium text-slate-900">{k.adSoyad}</td>
                                <td className="py-2.5 text-slate-600">{k.ilanPozisyon}</td>
                                <td className="py-2.5 text-slate-600">{k.departman}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}