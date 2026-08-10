import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Ilanlar() {
    const { adminMi } = useAuth();

    const [ilanlar, setIlanlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);

    const [formAcik, setFormAcik] = useState(false);
    const [kaydediliyor, setKaydediliyor] = useState(false);
    const [formHata, setFormHata] = useState(null);
    const [islemYapilan, setIslemYapilan] = useState(null);

    const [form, setForm] = useState({
        pozisyon: '',
        departman: '',
        nitelikler: '',
        aciklama: '',
        durum: 'ACIK',
    });

    useEffect(() => {
        ilanlariGetir();
    }, []);

    async function ilanlariGetir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const veri = await api.get('/api/ilanlar');
            setIlanlar(veri);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    function formDegis(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function formGonder(e) {
        e.preventDefault();
        setKaydediliyor(true);
        setFormHata(null);
        try {
            await api.post('/api/ilanlar', form);
            setForm({ pozisyon: '', departman: '', nitelikler: '', aciklama: '', durum: 'ACIK' });
            setFormAcik(false);
            await ilanlariGetir();
        } catch (err) {
            setFormHata(err.message);
        } finally {
            setKaydediliyor(false);
        }
    }

    async function durumDegistir(ilan) {
        setIslemYapilan(ilan.id);
        setHata(null);
        try {
            const yeniDurum = ilan.durum === 'ACIK' ? 'KAPALI' : 'ACIK';
            await api.put(`/api/ilanlar/${ilan.id}`, { ...ilan, durum: yeniDurum });
            await ilanlariGetir();
        } catch (err) {
            setHata(err.message);
        } finally {
            setIslemYapilan(null);
        }
    }

    async function ilanSil(ilan) {
        if (!window.confirm(`"${ilan.pozisyon}" ilanını silmek istediğinize emin misiniz?`)) {
            return;
        }
        setIslemYapilan(ilan.id);
        setHata(null);
        try {
            await api.del(`/api/ilanlar/${ilan.id}`);
            await ilanlariGetir();
        } catch (err) {
            setHata(err.message);
        } finally {
            setIslemYapilan(null);
        }
    }

    if (yukleniyor) {
        return <p className="text-gray-500">Yükleniyor...</p>;
    }

    return (
        <div>
            {/* Baslik ve yeni ilan butonu */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">İlanlar</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{ilanlar.length} ilan</span>
                    <button
                        onClick={() => setFormAcik(!formAcik)}
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
                    >
                        {formAcik ? 'Vazgeç' : '+ Yeni ilan'}
                    </button>
                </div>
            </div>

            {/* Genel hata (liste cekme, silme, durum degistirme) */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{hata}</p>
                    <button
                        onClick={ilanlariGetir}
                        className="mt-2 text-sm border border-red-300 rounded px-3 py-1 hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {/* Yeni ilan formu */}
            {formAcik && (
                <form onSubmit={formGonder} className="bg-white border rounded-lg p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                            <input
                                name="pozisyon"
                                value={form.pozisyon}
                                onChange={formDegis}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
                            <input
                                name="departman"
                                value={form.departman}
                                onChange={formDegis}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nitelikler <span className="text-gray-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="nitelikler"
                            value={form.nitelikler}
                            onChange={formDegis}
                            required
                            placeholder="Java, Spring, SQL"
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                        <textarea
                            name="aciklama"
                            value={form.aciklama}
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

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </form>
            )}

            {/* Liste veya bos durum */}
            {ilanlar.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border rounded-lg bg-white">
                    <p>Henüz ilan yok.</p>
                    <p className="text-sm mt-1">Yukarıdaki butondan ilk ilanı oluşturabilirsiniz.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ilanlar.map((ilan) => (
                        <div key={ilan.id} className="bg-white border rounded-lg p-4 hover:border-gray-300">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="font-medium text-gray-900">{ilan.pozisyon}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{ilan.departman}</p>
                                </div>
                                <span
                                    className={
                                        ilan.durum === 'ACIK'
                                            ? 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'
                                            : 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600'
                                    }
                                >
                                    {ilan.durum === 'ACIK' ? 'Açık' : 'Kapalı'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">{ilan.aciklama}</p>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {ilan.nitelikler.split(',').map((nitelik) => (
                                    <span
                                        key={nitelik}
                                        className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5"
                                    >
                                        {nitelik.trim()}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t">
                                <button
                                    onClick={() => durumDegistir(ilan)}
                                    disabled={islemYapilan === ilan.id}
                                    className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {ilan.durum === 'ACIK' ? 'İlanı kapat' : 'İlanı aç'}
                                </button>

                                {adminMi && (
                                    <button
                                        onClick={() => ilanSil(ilan)}
                                        disabled={islemYapilan === ilan.id}
                                        className="text-sm border border-red-200 text-red-600 rounded px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Sil
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}