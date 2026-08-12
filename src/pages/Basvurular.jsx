import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';


const ASAMA_ADI = {
    BASVURU: 'Başvuru',
    ON_ELEME: 'Ön Eleme',
    MULAKAT: 'Mülakat',
    TEKLIF: 'Teklif',
    ISE_ALINDI: 'İşe Alındı',
    ELENDI: 'Elendi',
};

// Huni sirasi: hem rozet renkleri hem siralama icin tek kaynak
const ASAMA_SIRASI = ['BASVURU', 'ON_ELEME', 'MULAKAT', 'TEKLIF', 'ISE_ALINDI', 'ELENDI'];

const ASAMA_STILI = {
    BASVURU: 'bg-slate-50 text-slate-600 ring-slate-500/20',
    ON_ELEME: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    MULAKAT: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    TEKLIF: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    ISE_ALINDI: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    ELENDI: 'bg-red-50 text-red-700 ring-red-600/20',
};

const ASAMA_NOKTASI = {
    BASVURU: 'bg-slate-400',
    ON_ELEME: 'bg-blue-500',
    MULAKAT: 'bg-violet-500',
    TEKLIF: 'bg-amber-500',
    ISE_ALINDI: 'bg-emerald-500',
    ELENDI: 'bg-red-500',
};

const SUTUNLAR = [
    { alan: 'adSoyad', baslik: 'Aday' },
    { alan: 'ilanPozisyon', baslik: 'Pozisyon' },
    { alan: 'asama', baslik: 'Aşama' },
    { alan: 'basvuruTarihi', baslik: 'Tarih' },
    { alan: 'aktiviteSayisi', baslik: 'Aktivite', sagaYasli: true },
];

const SAYFA_BOYUTU = 10;

function basHarfler(adSoyad) {
    return (adSoyad || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toLocaleUpperCase('tr');
}

// "2026-08-12" -> "12 Ağu 2026" (saat dilimi kaymasi olmadan)
function tarihYaz(isoTarih) {
    if (!isoTarih) return '—';
    const [yil, ay, gun] = isoTarih.split('-').map(Number);
    return new Date(yil, ay - 1, gun).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function AsamaRozeti({ asama }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ASAMA_STILI[asama]}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${ASAMA_NOKTASI[asama]}`} />
            {ASAMA_ADI[asama]}
        </span>
    );
}

export default function Basvurular() {
    const navigate = useNavigate();
    const [basvurular, setBasvurular] = useState([]);
    const [adaylar, setAdaylar] = useState([]);
    const [ilanlar, setIlanlar] = useState([]);

    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);

    const [formAcik, setFormAcik] = useState(false);
    const [kaydediliyor, setKaydediliyor] = useState(false);
    const [formHata, setFormHata] = useState(null);
    const [secilenAday, setSecilenAday] = useState('');
    const [secilenIlan, setSecilenIlan] = useState('');

    const [arama, setArama] = useState('');
    const [asamaFiltre, setAsamaFiltre] = useState(null);
    const [siralama, setSiralama] = useState({ alan: 'basvuruTarihi', yon: 'azalan' });
    const [sayfa, setSayfa] = useState(1);

    useEffect(() => {
        hepsiniGetir();
    }, []);

    async function hepsiniGetir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const [b, a, i] = await Promise.all([
                api.get('/api/basvurular'),
                api.get('/api/adaylar'),
                api.get('/api/ilanlar'),
            ]);
            setBasvurular(b);
            setAdaylar(a);
            setIlanlar(i);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    async function basvuruOlustur(e) {
        e.preventDefault();
        setKaydediliyor(true);
        setFormHata(null);
        try {
            await api.postParam(
                `/api/basvurular?adayId=${secilenAday}&ilanId=${secilenIlan}`
            );
            setSecilenAday('');
            setSecilenIlan('');
            setFormAcik(false);
            await hepsiniGetir();
        } catch (err) {
            setFormHata(err.message);
        } finally {
            setKaydediliyor(false);
        }
    }

    function sirala(alan) {
        setSiralama((o) =>
            o.alan === alan
                ? { alan, yon: o.yon === 'artan' ? 'azalan' : 'artan' }
                : { alan, yon: 'artan' }
        );
        setSayfa(1);
    }

    function aramaDegis(deger) {
        setArama(deger);
        setSayfa(1);
    }

    function asamaSec(asama) {
        setAsamaFiltre((o) => (o === asama ? null : asama));
        setSayfa(1);
    }

    if (yukleniyor) {
        return (
            <div>
                <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="rounded-xl border border-slate-200 bg-white mt-5 p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                            <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                            <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                            <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const acikIlanlar = ilanlar.filter((i) => i.durum === 'ACIK');

    // Asama bazli sayimlar (filtre cipleri icin)
    const asamaSayimlari = ASAMA_SIRASI.map((asama) => ({
        asama,
        sayi: basvurular.filter((b) => b.asama === asama).length,
    })).filter((s) => s.sayi > 0);

    const kucuk = arama.toLocaleLowerCase('tr');
    const filtreli = basvurular
        .filter((b) => (asamaFiltre ? b.asama === asamaFiltre : true))
        .filter(
            (b) =>
                b.adSoyad.toLocaleLowerCase('tr').includes(kucuk) ||
                b.ilanPozisyon.toLocaleLowerCase('tr').includes(kucuk)
        );

    const sirali = [...filtreli].sort((a, b) => {
        const { alan, yon } = siralama;
        let x = a[alan];
        let y = b[alan];
        if (alan === 'asama') {
            x = ASAMA_SIRASI.indexOf(x);
            y = ASAMA_SIRASI.indexOf(y);
        }
        let sonuc;
        if (typeof x === 'number' && typeof y === 'number') {
            sonuc = x - y;
        } else {
            sonuc = String(x).localeCompare(String(y), 'tr');
        }
        return yon === 'artan' ? sonuc : -sonuc;
    });

    const toplamSayfa = Math.max(1, Math.ceil(sirali.length / SAYFA_BOYUTU));
    const gecerliSayfa = Math.min(sayfa, toplamSayfa);
    const basla = (gecerliSayfa - 1) * SAYFA_BOYUTU;
    const sayfadakiler = sirali.slice(basla, basla + SAYFA_BOYUTU);

    return (
        <div>
            {/* Baslik */}
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Başvurular</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {filtreli.length === basvurular.length
                            ? `${basvurular.length} başvuru`
                            : `${filtreli.length} / ${basvurular.length} başvuru`}
                    </p>
                </div>
                <button
                    onClick={() => setFormAcik(!formAcik)}
                    className={
                        formAcik
                            ? 'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100'
                            : 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    }
                >
                    {formAcik ? 'Vazgeç' : '+ Yeni başvuru'}
                </button>
            </div>

            {/* Yeni basvuru formu */}
            {formAcik && (
                <form
                    onSubmit={basvuruOlustur}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-4 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="aday" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Aday
                            </label>
                            <select
                                id="aday"
                                value={secilenAday}
                                onChange={(e) => setSecilenAday(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                                <option value="">Aday seçin</option>
                                {adaylar.map((aday) => (
                                    <option key={aday.id} value={aday.id}>
                                        {aday.adSoyad}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="ilan" className="block text-sm font-medium text-slate-700 mb-1.5">
                                İlan{' '}
                                <span className="text-slate-400 font-normal">(yalnızca açık ilanlar)</span>
                            </label>
                            <select
                                id="ilan"
                                value={secilenIlan}
                                onChange={(e) => setSecilenIlan(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                                <option value="">İlan seçin</option>
                                {acikIlanlar.map((ilan) => (
                                    <option key={ilan.id} value={ilan.id}>
                                        {ilan.pozisyon} — {ilan.departman}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {formHata && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                            {formHata}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {kaydediliyor ? 'Oluşturuluyor...' : 'Başvuru oluştur'}
                    </button>
                </form>
            )}

            {/* Genel hata */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-700">{hata}</p>
                    <button
                        onClick={hepsiniGetir}
                        className="mt-2.5 text-sm border border-red-300 rounded-lg px-3 py-1.5 text-red-700 transition hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {basvurular.length === 0 ? (
                <div className="text-center py-14 border border-slate-200 rounded-xl bg-white">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        +
                    </div>
                    <p className="text-slate-700 font-medium mt-3">Henüz başvuru yok</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Bir adayı açık bir ilana başvurtarak başlayın.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Arac cubugu: arama + asama filtreleri */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
                        <input
                            type="search"
                            value={arama}
                            onChange={(e) => aramaDegis(e.target.value)}
                            placeholder="Aday veya pozisyon ara..."
                            className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />

                        <div className="flex flex-wrap items-center gap-1.5">
                            {asamaSayimlari.map(({ asama, sayi }) => (
                                <button
                                    key={asama}
                                    onClick={() => asamaSec(asama)}
                                    aria-pressed={asamaFiltre === asama}
                                    className={
                                        asamaFiltre === asama
                                            ? `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ASAMA_STILI[asama]}`
                                            : 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700'
                                    }
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${ASAMA_NOKTASI[asama]}`} />
                                    {ASAMA_ADI[asama]}
                                    <span className="tabular-nums opacity-60">{sayi}</span>
                                </button>
                            ))}
                            {asamaFiltre && (
                                <button
                                    onClick={() => asamaSec(asamaFiltre)}
                                    className="text-xs text-slate-500 underline underline-offset-2 transition hover:text-slate-800 ml-1"
                                >
                                    filtreyi temizle
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tablo */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    {SUTUNLAR.map((sutun) => {
                                        const aktif = siralama.alan === sutun.alan;
                                        return (
                                            <th
                                                key={sutun.alan}
                                                scope="col"
                                                aria-sort={
                                                    aktif
                                                        ? siralama.yon === 'artan'
                                                            ? 'ascending'
                                                            : 'descending'
                                                        : 'none'
                                                }
                                                className={`px-4 py-2.5 font-semibold ${sutun.sagaYasli ? 'text-right' : 'text-left'}`}
                                            >
                                                <button
                                                    onClick={() => sirala(sutun.alan)}
                                                    className={`group inline-flex items-center gap-1 text-xs uppercase tracking-wide transition ${
                                                        aktif
                                                            ? 'text-slate-900'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    {sutun.baslik}
                                                    <span
                                                        className={`text-[10px] leading-none transition ${aktif ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
                                                    >
                                                        {aktif && siralama.yon === 'artan' ? '▲' : '▼'}
                                                    </span>
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {sayfadakiler.map((b) => (
                                    <tr
                                        key={b.id}
                                        onClick={() => navigate(`/basvurular/${b.id}`)}
                                        className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                                    {basHarfler(b.adSoyad)}
                                                </span>
                                                <span className="font-medium text-slate-900">
                                                    {b.adSoyad}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{b.ilanPozisyon}</td>
                                        <td className="px-4 py-3">
                                            <AsamaRozeti asama={b.asama} />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                                            {tarihYaz(b.basvuruTarihi)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {b.aktiviteSayisi > 0 ? (
                                                <span className="inline-flex min-w-6 justify-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
                                                    {b.aktiviteSayisi}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Filtre sonucu bos */}
                    {sirali.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <p className="text-slate-700 font-medium">Eşleşen başvuru yok</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Aramayı değiştirin veya aşama filtresini kaldırın.
                            </p>
                        </div>
                    )}

                    {/* Sayfalama */}
                    {sirali.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                            <p className="text-xs text-slate-500 tabular-nums">
                                {basla + 1}–{Math.min(basla + SAYFA_BOYUTU, sirali.length)} / {sirali.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setSayfa(gecerliSayfa - 1)}
                                    disabled={gecerliSayfa === 1}
                                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Önceki
                                </button>
                                <span className="px-2 text-xs text-slate-500 tabular-nums">
                                    {gecerliSayfa} / {toplamSayfa}
                                </span>
                                <button
                                    onClick={() => setSayfa(gecerliSayfa + 1)}
                                    disabled={gecerliSayfa === toplamSayfa}
                                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Sonraki
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
