import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import SayfaBasligi from '../components/SayfaBasligi';
import Avatar from '../components/Avatar';
import AsamaRozeti from '../components/AsamaRozeti';
import BosDurum from '../components/BosDurum';
import { ASAMA_ADI, ASAMA_SIRASI, ASAMA_TONU } from '../utils/asama';
import { TONLAR } from '../utils/rozetTonlari';
import { tarihYaz } from '../utils/tarih';
import { ETIKET, SECIM, GIRDI_KUCUK, BUTON_BIRINCIL, BUTON_IKINCIL } from '../components/formStilleri';

const SUTUNLAR = [
    { alan: 'adSoyad', baslik: 'Aday' },
    { alan: 'ilanPozisyon', baslik: 'Pozisyon' },
    { alan: 'asama', baslik: 'Aşama' },
    { alan: 'basvuruTarihi', baslik: 'Tarih' },
    { alan: 'aktiviteSayisi', baslik: 'Aktivite', sagaYasli: true },
];

const SAYFA_BOYUTU = 10;

export default function Basvurular() {
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
            <SayfaBasligi
                baslik="Başvurular"
                sayac={
                    filtreli.length === basvurular.length
                        ? `${basvurular.length} başvuru`
                        : `${filtreli.length} / ${basvurular.length} başvuru`
                }
            >
                <button
                    onClick={() => setFormAcik(!formAcik)}
                    className={formAcik ? BUTON_IKINCIL : BUTON_BIRINCIL}
                >
                    {formAcik ? 'Vazgeç' : '+ Yeni başvuru'}
                </button>
            </SayfaBasligi>

            {/* Yeni basvuru formu */}
            {formAcik && (
                <form
                    onSubmit={basvuruOlustur}
                    className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="aday" className={ETIKET}>
                                Aday
                            </label>
                            <select
                                id="aday"
                                value={secilenAday}
                                onChange={(e) => setSecilenAday(e.target.value)}
                                required
                                className={SECIM}
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
                            <label htmlFor="ilan" className={ETIKET}>
                                İlan{' '}
                                <span className="text-slate-400 font-normal">(yalnızca açık ilanlar)</span>
                            </label>
                            <select
                                id="ilan"
                                value={secilenIlan}
                                onChange={(e) => setSecilenIlan(e.target.value)}
                                required
                                className={SECIM}
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
                        className={BUTON_BIRINCIL}
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
                <BosDurum
                    baslik="Henüz başvuru yok"
                    aciklama="Bir adayı açık bir ilana başvurtarak başlayın."
                />
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Arac cubugu: arama + asama filtreleri */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
                        <input
                            type="search"
                            value={arama}
                            onChange={(e) => aramaDegis(e.target.value)}
                            placeholder="Aday veya pozisyon ara..."
                            className={`${GIRDI_KUCUK} w-64`}
                        />

                        <div className="flex flex-wrap items-center gap-1.5">
                            {asamaSayimlari.map(({ asama, sayi }) => (
                                <button
                                    key={asama}
                                    onClick={() => asamaSec(asama)}
                                    aria-pressed={asamaFiltre === asama}
                                    className={
                                        asamaFiltre === asama
                                            ? `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TONLAR[ASAMA_TONU[asama]].kutu}`
                                            : 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700'
                                    }
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${TONLAR[ASAMA_TONU[asama]].nokta}`} />
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
                                        className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 focus-within:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            {/* Link satirin tamamini kaplar: fare ve klavye ayni hedefe gider */}
                                            <Link
                                                to={`/basvurular/${b.id}`}
                                                className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                                            >
                                                <Avatar ad={b.adSoyad} boyut="sm" />
                                                <span className="font-medium text-slate-900 group-hover:text-blue-700">
                                                    {b.adSoyad}
                                                </span>
                                            </Link>
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
                        <BosDurum
                            simge="?"
                            baslik="Eşleşen başvuru yok"
                            aciklama="Aramayı değiştirin veya aşama filtresini kaldırın."
                            cerceveli={false}
                        />
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
