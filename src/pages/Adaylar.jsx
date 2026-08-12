import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SayfaBasligi from '../components/SayfaBasligi';
import Kart from '../components/Kart';
import Avatar from '../components/Avatar';
import BosDurum from '../components/BosDurum';
import { ETIKET, GIRDI, BUTON_BIRINCIL, BUTON_IKINCIL, BUTON_TEHLIKE } from '../components/formStilleri';

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
            <SayfaBasligi
                baslik="Adaylar"
                sayac={arama ? `${filtreli.length} / ${adaylar.length} aday` : `${adaylar.length} aday`}
            >
                <button
                    onClick={() => setFormAcik(!formAcik)}
                    className={formAcik ? BUTON_IKINCIL : BUTON_BIRINCIL}
                >
                    {formAcik ? 'Vazgeç' : '+ Yeni aday'}
                </button>
            </SayfaBasligi>

            {/* Arama */}
            <input
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İsim, e-posta veya yetenek ara..."
                className={`${GIRDI} mb-4`}
            />

            {/* Yeni aday formu */}
            {formAcik && (
                <form onSubmit={formGonder} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4 space-y-4">

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
                            <label className={ETIKET}>Ad Soyad</label>
                            <input
                                name="adSoyad"
                                value={form.adSoyad}
                                onChange={formDegis}
                                required
                                className={GIRDI}
                            />
                        </div>
                        <div>
                            <label className={ETIKET}>E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={formDegis}
                                required
                                className={GIRDI}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={ETIKET}>Telefon</label>
                        <input
                            name="telefon"
                            value={form.telefon}
                            onChange={formDegis}
                            className={GIRDI}
                        />
                    </div>

                    <div>
                        <label className={ETIKET}>
                            Yetenekler <span className="text-slate-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="yetenekler"
                            value={form.yetenekler}
                            onChange={formDegis}
                            placeholder="Java, Spring, SQL"
                            className={GIRDI}
                        />
                    </div>

                    <div>
                        <label className={ETIKET}>Özet</label>
                        <textarea
                            name="ozet"
                            value={form.ozet}
                            onChange={formDegis}
                            rows={2}
                            className={GIRDI}
                        />
                    </div>

                    {formHata && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                            {formHata}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={kaydediliyor || cvYukleniyor}
                            className={BUTON_BIRINCIL}
                        >
                            {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                            type="button"
                            onClick={formuTemizle}
                            className={BUTON_IKINCIL}
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
                <BosDurum
                    simge={arama ? '?' : '+'}
                    baslik={arama ? 'Aramanıza uyan aday bulunamadı' : 'Henüz aday yok'}
                    aciklama={
                        arama
                            ? 'Farklı bir isim, e-posta veya yetenek deneyin.'
                            : 'Yukarıdaki butondan ilk adayı ekleyebilirsiniz.'
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filtreli.map((aday) => (
                        <Kart key={aday.id} hoverli>
                            <div className="flex items-start gap-3">
                                <Avatar ad={aday.adSoyad} boyut="lg" />
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
                                        className={BUTON_TEHLIKE}
                                    >
                                        Sil
                                    </button>
                                </div>
                            )}
                        </Kart>
                    ))}
                </div>
            )}
        </div>
    );
}