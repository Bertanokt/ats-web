import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import KariyerDuzeni from '../components/KariyerDuzeni';
import Kart from '../components/Kart';
import BosDurum from '../components/BosDurum';

export default function Kariyer() {
    const [ilanlar, setIlanlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);

    useEffect(() => {
        ilanlariGetir();
    }, []);

    async function ilanlariGetir() {
        setYukleniyor(true);
        setHata(null);
        try {
            // Public uc: token gerektirmiyor, client.js token yoksa baslik eklemiyor
            const veri = await api.get('/api/public/ilanlar');
            setIlanlar(veri);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    return (
        <KariyerDuzeni>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Açık Pozisyonlar
                </h1>
                <p className="mt-2 text-slate-600">
                    Ekibimize katılmak için aşağıdaki ilanları inceleyip başvurabilirsiniz.
                </p>
            </div>

            {yukleniyor && (
                <div className="space-y-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="rounded-xl border border-slate-200 bg-white p-6">
                            <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
                            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
                            <div className="mt-4 h-3 w-full max-w-md animate-pulse rounded bg-slate-100" />
                            <div className="mt-4 flex gap-1.5">
                                <div className="h-5 w-14 animate-pulse rounded bg-slate-100" />
                                <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
                                <div className="h-5 w-12 animate-pulse rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!yukleniyor && hata && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm text-red-700">
                        İlanlar yüklenemedi. Lütfen daha sonra tekrar deneyin.
                    </p>
                    <p className="mt-1 text-xs text-red-500">{hata}</p>
                    <button
                        onClick={ilanlariGetir}
                        className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {!yukleniyor && !hata && ilanlar.length === 0 && (
                <BosDurum
                    simge="—"
                    baslik="Şu anda açık pozisyon yok"
                    aciklama="Yeni ilanlar için daha sonra tekrar kontrol edebilirsiniz."
                />
            )}

            {!yukleniyor && !hata && ilanlar.length > 0 && (
                <>
                    <p className="mb-4 text-sm text-slate-500">
                        {ilanlar.length} açık pozisyon
                    </p>

                    <div className="space-y-4">
                        {ilanlar.map((ilan) => (
                            <Link
                                key={ilan.id}
                                to={`/kariyer/${ilan.id}`}
                                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                            >
                                <Kart hoverli dolgu="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                                            {ilan.pozisyon}
                                        </h2>
                                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                            {ilan.departman}
                                        </span>
                                    </div>

                                    {ilan.aciklama && (
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            {ilan.aciklama}
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {(ilan.nitelikler || '')
                                            .split(',')
                                            .map((n) => n.trim())
                                            .filter(Boolean)
                                            .map((nitelik) => (
                                                <span
                                                    key={nitelik}
                                                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                                                >
                                                    {nitelik}
                                                </span>
                                            ))}
                                    </div>

                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                                        Başvur
                                        <span className="transition-transform group-hover:translate-x-0.5">
                                            →
                                        </span>
                                    </span>
                                </Kart>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </KariyerDuzeni>
    );
}
