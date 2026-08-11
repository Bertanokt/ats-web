import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Adaylar() {
    const { adminMi } = useAuth();

    const [adaylar, setAdaylar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);
    const [arama, setArama] = useState('');
    const [islemYapilan, setIslemYapilan] = useState(null);

    const [formAcik, setFormAcik] = useState(false);
    const [kaydediliyor, setKaydediliyor] = useState(false);
    const [formHata, setFormHata] = useState(null);
    const [cvYukleniyor, setCvYukleniyor] = useState(false);
    const [cvBilgi, setCvBilgi] = useState(null);

    const [form, setForm] = useState({
        adSoyad: '',
        email: '',
        telefon: '',
        yetenekler: '',
        ozet: '',
    });

    useEffect(() => {
        adaylariGetir();
    }, []);

    async function adaylariGetir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const veri = await api.get('/api/adaylar');
            setAdaylar(veri);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    async function adaySil(aday) {
        if (!window.confirm(`"${aday.adSoyad}" adayını silmek istediğinize emin misiniz?`)) {
            return;
        }
        setIslemYapilan(aday.id);
        setHata(null);
        try {
            await api.del(`/api/adaylar/${aday.id}`);
            await adaylariGetir();
        } catch (err) {
            setHata(err.message);
        } finally {
            setIslemYapilan(null);
        }
    }

    function formDegis(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function formuTemizle() {
        setForm({ adSoyad: '', email: '', telefon: '', yetenekler: '', ozet: '' });
        setCvBilgi(null);
        setFormHata(null);
    }

    async function cvSecildi(e) {
        const dosya = e.target.files[0];
        if (!dosya) return;

        setCvYukleniyor(true);
        setFormHata(null);
        setCvBilgi(null);

        try {
            const sonuc = await api.upload('/api/adaylar/cv-parse', dosya);
            setForm({
                adSoyad: sonuc.adSoyad || '',
                email: sonuc.email || '',
                telefon: sonuc.telefon || '',
                yetenekler: sonuc.yetenekler || '',
                ozet: sonuc.ozet || '',
            });
            setCvBilgi(`"${dosya.name}" okundu. Bilgileri kontrol edip kaydedin.`);
        } catch (err) {
            setFormHata(err.message);
        } finally {
            setCvYukleniyor(false);
            e.target.value = '';
        }
    }

    async function formGonder(e) {
        e.preventDefault();
        setKaydediliyor(true);
        setFormHata(null);
        try {
            await api.post('/api/adaylar', form);
            formuTemizle();
            setFormAcik(false);
            await adaylariGetir();
        } catch (err) {
            setFormHata(err.message);
        } finally {
            setKaydediliyor(false);
        }
    }

    const kucuk = arama.toLocaleLowerCase('tr');
    const filtreli = adaylar.filter((aday) =>
        aday.adSoyad.toLocaleLowerCase('tr').includes(kucuk) ||
        aday.email.toLocaleLowerCase('tr').includes(kucuk) ||
        (aday.yetenekler || '').toLocaleLowerCase('tr').includes(kucuk)
    );

    if (yukleniyor) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                        <div className="h-3 w-56 rounded bg-slate-100 mt-2.5 animate-pulse" />
                        <div className="h-3 w-full max-w-sm rounded bg-slate-100 mt-3 animate-pulse" />
                        <div className="flex gap-1.5 mt-3">
                            <div className="h-5 w-14 rounded bg-slate-100 animate-pulse" />
                            <div className="h-5 w-16 rounded bg-slate-100 animate-pulse" />
                            <div className="h-5 w-12 rounded bg-slate-100 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Baslik ve yeni aday butonu */}
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Adaylar</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {arama ? `${filtreli.length} / ${adaylar.length} aday` : `${adaylar.length} aday`}
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
                    {formAcik ? 'Vazgeç' : '+ Yeni aday'}
                </button>
            </div>

            {/* Arama */}
            <input
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İsim, e-posta veya yetenek ara..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-4 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />

            {/* Yeni aday formu */}
            {formAcik && (
                <form onSubmit={formGonder} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-4 space-y-4">

                    {/* CV yukleme */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                            Özgeçmişten otomatik doldur
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={cvSecildi}
                            disabled={cvYukleniyor}
                            className="block w-full text-sm text-slate-600
                                       file:mr-3 file:py-1.5 file:px-3
                                       file:rounded-lg file:border-0
                                       file:bg-blue-600 file:text-white
                                       file:text-sm file:font-medium
                                       file:transition hover:file:bg-blue-700
                                       file:cursor-pointer
                                       disabled:opacity-50"
                        />
                        {cvYukleniyor && (
                            <p className="text-sm text-blue-700 mt-2">
                                Özgeçmiş okunuyor, bu birkaç saniye sürebilir...
                            </p>
                        )}
                        {cvBilgi && (
                            <p className="text-sm text-blue-800 mt-2">{cvBilgi}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad</label>
                            <input
                                name="adSoyad"
                                value={form.adSoyad}
                                onChange={formDegis}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={formDegis}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                        <input
                            name="telefon"
                            value={form.telefon}
                            onChange={formDegis}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Yetenekler <span className="text-gray-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="yetenekler"
                            value={form.yetenekler}
                            onChange={formDegis}
                            placeholder="Java, Spring, SQL"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Özet</label>
                        <textarea
                            name="ozet"
                            value={form.ozet}
                            onChange={formDegis}
                            rows={2}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    {formHata && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
                            {formHata}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={kaydediliyor || cvYukleniyor}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        >
                            {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                            type="button"
                            onClick={formuTemizle}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            Temizle
                        </button>
                    </div>
                </form>
            )}

            {/* Genel hata */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-700">{hata}</p>
                    <button
                        onClick={adaylariGetir}
                        className="mt-2.5 text-sm border border-red-300 rounded-lg px-3 py-1.5 text-red-700 transition hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {/* Liste veya bos durum */}
            {filtreli.length === 0 ? (
                <div className="text-center py-14 border border-slate-200 rounded-xl bg-white">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        {arama ? '?' : '+'}
                    </div>
                    <p className="text-slate-700 font-medium mt-3">
                        {arama ? 'Aramanıza uyan aday bulunamadı' : 'Henüz aday yok'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        {arama
                            ? 'Farklı bir isim, e-posta veya yetenek deneyin.'
                            : 'Yukarıdaki butondan ilk adayı ekleyebilirsiniz.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtreli.map((aday) => (
                        <div
                            key={aday.id}
                            className="bg-white border border-slate-200 rounded-xl p-5 transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                                    {aday.adSoyad
                                        .trim()
                                        .split(/\s+/)
                                        .slice(0, 2)
                                        .map((p) => p[0])
                                        .join('')
                                        .toLocaleUpperCase('tr')}
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-slate-900">{aday.adSoyad}</h2>
                                    <p className="text-sm text-slate-500 mt-0.5 truncate">
                                        {aday.email}
                                        {aday.telefon && ` · ${aday.telefon}`}
                                    </p>
                                </div>
                            </div>

                            {aday.ozet && (
                                <p className="text-sm text-slate-600 mt-3">{aday.ozet}</p>
                            )}

                            {aday.yetenekler && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {aday.yetenekler.split(',').map((yetenek) => (
                                        <span
                                            key={yetenek}
                                            className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5"
                                        >
                                            {yetenek.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {adminMi && (
                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => adaySil(aday)}
                                        disabled={islemYapilan === aday.id}
                                        className="text-sm border border-slate-200 text-slate-500 rounded-lg px-3 py-1.5 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                        Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}