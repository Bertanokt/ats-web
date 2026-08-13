import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import SayfaBasligi from '../components/SayfaBasligi';
import Kart from '../components/Kart';
import Avatar from '../components/Avatar';
import BosDurum from '../components/BosDurum';
import AsamaDagilimi from '../components/AsamaDagilimi';
import { TONLAR } from '../utils/rozetTonlari';
import { tarihYaz } from '../utils/tarih';
import { SECIM_DAR } from '../components/formStilleri';

function cipStili(aktif) {
    return aktif
        ? `rounded-full px-3 py-1 text-xs font-medium ring-1 ${TONLAR.mavi.kutu}`
        : 'rounded-full px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700';
}

export default function Raporlar() {
    const [dagilim, setDagilim] = useState([]);
    const [iseAlinanlar, setIseAlinanlar] = useState([]);
    const [ilanlar, setIlanlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);
    const [departman, setDepartman] = useState('');

    const [secilenIlan, setSecilenIlan] = useState('');
    const [ilanDagilim, setIlanDagilim] = useState([]);
    const [ilanYukleniyor, setIlanYukleniyor] = useState(false);

    useEffect(() => {
        getir();
    }, []);

    // Secilen ilanin asama dagilimi. iptal bayragi, hizli secim
    // degistirmede eski cevabin yenisini ezmesini onler.
    useEffect(() => {
        if (!secilenIlan) return;

        let iptal = false;

        api.get(`/api/basvurular/ilan/${secilenIlan}/asama-raporu`)
            .then((r) => {
                if (!iptal) setIlanDagilim(r);
            })
            .catch((err) => {
                if (!iptal) setHata(err.message);
            })
            .finally(() => {
                if (!iptal) setIlanYukleniyor(false);
            });

        return () => {
            iptal = true;
        };
    }, [secilenIlan]);

    function ilanSec(id) {
        setSecilenIlan(id);
        setIlanYukleniyor(true);
    }

    async function getir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const [d, i, il] = await Promise.all([
                api.get('/api/basvurular/rapor/funnel'),
                api.get('/api/basvurular/ise-alinanlar'),
                api.get('/api/ilanlar'),
            ]);
            setDagilim(d);
            setIseAlinanlar(i);
            setIlanlar(il);
            if (il.length > 0) {
                setSecilenIlan(String(il[0].id));
                setIlanYukleniyor(true);
            }
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    if (yukleniyor) {
        return (
            <div>
                <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="mt-5 space-y-6">
                    <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
                </div>
            </div>
        );
    }

    if (hata) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{hata}</p>
                <button
                    onClick={getir}
                    className="mt-2.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-100"
                >
                    Tekrar dene
                </button>
            </div>
        );
    }

    const toplam = dagilim.reduce((t, s) => t + s.adet, 0);
    const ilanToplam = ilanDagilim.reduce((t, s) => t + s.adet, 0);
    const secilenIlanBilgi = ilanlar.find((i) => String(i.id) === secilenIlan);

    // Departman listesi ise alinanlardan turetiliyor
    const departmanlar = [...new Set(iseAlinanlar.map((k) => k.departman))].sort((a, b) =>
        a.localeCompare(b, 'tr')
    );

    const filtreliIseAlinanlar = departman
        ? iseAlinanlar.filter((k) => k.departman === departman)
        : iseAlinanlar;

    return (
        <div className="space-y-6">
            <SayfaBasligi
                baslik="Raporlar"
                sayac={`${toplam} başvuru · ${iseAlinanlar.length} işe alım`}
            />

            {/* Genel asama dagilimi */}
            <Kart>
                <div className="mb-1 flex items-baseline justify-between">
                    <h2 className="font-semibold text-slate-900">Aşama dağılımı</h2>
                    <span className="text-sm text-slate-500">tüm ilanlar</span>
                </div>
                <p className="mb-5 text-xs text-slate-400">
                    Her aşamada şu an bekleyen başvuru sayısı — birikimli değil.
                </p>

                <AsamaDagilimi dagilim={dagilim} />
            </Kart>

            {/* Ilan bazli dagilim */}
            <Kart>
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-semibold text-slate-900">İlan bazlı dağılım</h2>
                    <select
                        value={secilenIlan}
                        onChange={(e) => ilanSec(e.target.value)}
                        aria-label="İlan seçin"
                        className={SECIM_DAR}
                    >
                        {ilanlar.map((ilan) => (
                            <option key={ilan.id} value={ilan.id}>
                                {ilan.pozisyon} — {ilan.departman}
                            </option>
                        ))}
                    </select>
                </div>
                <p className="mb-5 text-xs text-slate-400">
                    {secilenIlanBilgi
                        ? `${secilenIlanBilgi.pozisyon} ilanına başvuranların aşama dağılımı.`
                        : 'Bir ilan seçin.'}
                </p>

                {ilanlar.length === 0 ? (
                    <BosDurum
                        baslik="Henüz ilan yok"
                        aciklama="İlan oluşturulduğunda buradan kırılım alabilirsiniz."
                        cerceveli={false}
                    />
                ) : ilanToplam === 0 && !ilanYukleniyor ? (
                    <BosDurum
                        simge="?"
                        baslik="Bu ilana henüz başvuru yok"
                        aciklama="Başvuru geldikçe dağılım burada görünecek."
                        cerceveli={false}
                    />
                ) : (
                    // Yenilenirken onceki cizim soluk tutuluyor: iskelet sicramasi olmuyor
                    <div className={ilanYukleniyor ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                        <AsamaDagilimi dagilim={ilanDagilim} />
                    </div>
                )}
            </Kart>

            {/* Ise alinanlar */}
            <Kart dolgu="">
                <div className="flex items-baseline justify-between px-5 pt-5">
                    <h2 className="font-semibold text-slate-900">İşe alınanlar</h2>
                    <span className="text-sm text-slate-500">
                        {departman
                            ? `${filtreliIseAlinanlar.length} / ${iseAlinanlar.length} kişi`
                            : `${iseAlinanlar.length} kişi`}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 pb-3 pt-3">
                    <button onClick={() => setDepartman('')} className={cipStili(departman === '')}>
                        Tümü
                    </button>
                    {departmanlar.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDepartman(d)}
                            aria-pressed={departman === d}
                            className={cipStili(departman === d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {filtreliIseAlinanlar.length === 0 ? (
                    <BosDurum
                        simge="?"
                        baslik="Kayıt bulunamadı"
                        aciklama="Bu departmanda işe alınmış aday yok."
                        cerceveli={false}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Aday
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Pozisyon
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Departman
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Başvuru tarihi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtreliIseAlinanlar.map((k) => (
                                    <tr
                                        key={k.id}
                                        className="group border-t border-slate-100 transition-colors hover:bg-slate-50/70 focus-within:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/basvurular/${k.id}`}
                                                state={{ geriYol: '/raporlar', geriEtiket: 'Raporlara dön' }}
                                                className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                                            >
                                                <Avatar ad={k.adSoyad} boyut="sm" />
                                                <span className="font-medium text-slate-900 group-hover:text-blue-700">
                                                    {k.adSoyad}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{k.ilanPozisyon}</td>
                                        <td className="px-4 py-3 text-slate-600">{k.departman}</td>
                                        <td className="px-4 py-3 tabular-nums whitespace-nowrap text-slate-500">
                                            {tarihYaz(k.basvuruTarihi)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Kart>
        </div>
    );
}
