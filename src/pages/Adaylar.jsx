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
        return <p className="text-gray-500">Yükleniyor...</p>;
    }

    return (
        <div>
            {/* Baslik ve yeni aday butonu */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Adaylar</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                        {arama ? `${filtreli.length} / ${adaylar.length}` : `${adaylar.length} aday`}
                    </span>
                    <button
                        onClick={() => setFormAcik(!formAcik)}
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
                    >
                        {formAcik ? 'Vazgeç' : '+ Yeni aday'}
                    </button>
                </div>
            </div>

            {/* Arama */}
            <input
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İsim, e-posta veya yetenek ara..."
                className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Yeni aday formu */}
            {formAcik && (
                <form onSubmit={formGonder} className="bg-white border rounded-lg p-4 mb-4 space-y-3">

                    {/* CV yukleme */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                            Özgeçmişten otomatik doldur
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={cvSecildi}
                            disabled={cvYukleniyor}
                            className="block w-full text-sm text-gray-600
                                       file:mr-3 file:py-1.5 file:px-3
                                       file:rounded file:border-0
                                       file:bg-blue-600 file:text-white
                                       file:text-sm file:font-medium
                                       hover:file:bg-blue-700
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                            <input
                                name="adSoyad"
                                value={form.adSoyad}
                                onChange={formDegis}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={formDegis}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                            name="telefon"
                            value={form.telefon}
                            onChange={formDegis}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Yetenekler <span className="text-gray-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="yetenekler"
                            value={form.yetenekler}
                            onChange={formDegis}
                            placeholder="Java, Spring, SQL"
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Özet</label>
                        <textarea
                            name="ozet"
                            value={form.ozet}
                            onChange={formDegis}
                            rows={2}
                            className="w-full border rounded px-3 py-2"
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
                            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                            type="button"
                            onClick={formuTemizle}
                            className="border rounded px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Temizle
                        </button>
                    </div>
                </form>
            )}

            {/* Genel hata */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{hata}</p>
                    <button
                        onClick={adaylariGetir}
                        className="mt-2 text-sm border border-red-300 rounded px-3 py-1 hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {/* Liste veya bos durum */}
            {filtreli.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border rounded-lg bg-white">
                    <p>{arama ? 'Aramanıza uyan aday bulunamadı.' : 'Henüz aday yok.'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtreli.map((aday) => (
                        <div key={aday.id} className="bg-white border rounded-lg p-4 hover:border-gray-300">
                            <h2 className="font-medium text-gray-900">{aday.adSoyad}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {aday.email}
                                {aday.telefon && ` · ${aday.telefon}`}
                            </p>

                            {aday.ozet && (
                                <p className="text-sm text-gray-600 mt-2">{aday.ozet}</p>
                            )}

                            {aday.yetenekler && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {aday.yetenekler.split(',').map((yetenek) => (
                                        <span
                                            key={yetenek}
                                            className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5"
                                        >
                                            {yetenek.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {adminMi && (
                                <div className="flex gap-2 mt-4 pt-3 border-t">
                                    <button
                                        onClick={() => adaySil(aday)}
                                        disabled={islemYapilan === aday.id}
                                        className="text-sm border border-red-200 text-red-600 rounded px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
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