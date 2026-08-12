import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SayfaBasligi from '../components/SayfaBasligi';
import Kart from '../components/Kart';
import Rozet from '../components/Rozet';
import BosDurum from '../components/BosDurum';
import { ETIKET, GIRDI, BUTON_BIRINCIL, BUTON_IKINCIL, BUTON_TEHLIKE } from '../components/formStilleri';

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
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
                        <div className="h-3 w-24 rounded bg-slate-100 mt-2.5 animate-pulse" />
                        <div className="h-3 w-full max-w-md rounded bg-slate-100 mt-3 animate-pulse" />
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
            {/* Baslik ve yeni ilan butonu */}
            <SayfaBasligi baslik="İlanlar" sayac={`${ilanlar.length} ilan`}>
                <button
                    onClick={() => setFormAcik(!formAcik)}
                    className={formAcik ? BUTON_IKINCIL : BUTON_BIRINCIL}
                >
                    {formAcik ? 'Vazgeç' : '+ Yeni ilan'}
                </button>
            </SayfaBasligi>

            {/* Genel hata (liste cekme, silme, durum degistirme) */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-700">{hata}</p>
                    <button
                        onClick={ilanlariGetir}
                        className="mt-2.5 text-sm border border-red-300 rounded-lg px-3 py-1.5 text-red-700 transition hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {/* Yeni ilan formu */}
            {formAcik && (
                <form onSubmit={formGonder} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={ETIKET}>Pozisyon</label>
                            <input
                                name="pozisyon"
                                value={form.pozisyon}
                                onChange={formDegis}
                                required
                                className={GIRDI}
                            />
                        </div>
                        <div>
                            <label className={ETIKET}>Departman</label>
                            <input
                                name="departman"
                                value={form.departman}
                                onChange={formDegis}
                                required
                                className={GIRDI}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={ETIKET}>
                            Nitelikler <span className="text-slate-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="nitelikler"
                            value={form.nitelikler}
                            onChange={formDegis}
                            required
                            placeholder="Java, Spring, SQL"
                            className={GIRDI}
                        />
                    </div>

                    <div>
                        <label className={ETIKET}>Açıklama</label>
                        <textarea
                            name="aciklama"
                            value={form.aciklama}
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

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className={BUTON_BIRINCIL}
                    >
                        {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </form>
            )}

            {/* Liste veya bos durum */}
            {ilanlar.length === 0 ? (
                <BosDurum
                    baslik="Henüz ilan yok"
                    aciklama="Yukarıdaki butondan ilk ilanı oluşturabilirsiniz."
                />
            ) : (
                <div className="space-y-3">
                    {ilanlar.map((ilan) => (
                        <Kart key={ilan.id} hoverli>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">{ilan.pozisyon}</h2>
                                    <span className="inline-block text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5 mt-1.5">
                                        {ilan.departman}
                                    </span>
                                </div>
                                <Rozet
                                    ton={ilan.durum === 'ACIK' ? 'yesil' : 'notr'}
                                    className="shrink-0"
                                >
                                    {ilan.durum === 'ACIK' ? 'Açık' : 'Kapalı'}
                                </Rozet>
                            </div>

                            <p className="text-sm text-slate-600 mt-3">{ilan.aciklama}</p>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {ilan.nitelikler.split(',').map((nitelik) => (
                                    <span
                                        key={nitelik}
                                        className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5"
                                    >
                                        {nitelik.trim()}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => durumDegistir(ilan)}
                                    disabled={islemYapilan === ilan.id}
                                    className={`${BUTON_IKINCIL} px-3 py-1.5`}
                                >
                                    {ilan.durum === 'ACIK' ? 'İlanı kapat' : 'İlanı aç'}
                                </button>

                                {adminMi && (
                                    <button
                                        onClick={() => ilanSil(ilan)}
                                        disabled={islemYapilan === ilan.id}
                                        className={BUTON_TEHLIKE}
                                    >
                                        Sil
                                    </button>
                                )}
                            </div>
                        </Kart>
                    ))}
                </div>
            )}
        </div>
    );
}