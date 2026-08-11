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
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">İlanlar</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{ilanlar.length} ilan</p>
                </div>
                <button
                    onClick={() => setFormAcik(!formAcik)}
                    className={
                        formAcik
                            ? 'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100'
                            : 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    }
                >
                    {formAcik ? 'Vazgeç' : '+ Yeni ilan'}
                </button>
            </div>

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
                <form onSubmit={formGonder} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pozisyon</label>
                            <input
                                name="pozisyon"
                                value={form.pozisyon}
                                onChange={formDegis}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Departman</label>
                            <input
                                name="departman"
                                value={form.departman}
                                onChange={formDegis}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Nitelikler <span className="text-gray-400 font-normal">(virgülle ayırın)</span>
                        </label>
                        <input
                            name="nitelikler"
                            value={form.nitelikler}
                            onChange={formDegis}
                            required
                            placeholder="Java, Spring, SQL"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Açıklama</label>
                        <textarea
                            name="aciklama"
                            value={form.aciklama}
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

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </form>
            )}

            {/* Liste veya bos durum */}
            {ilanlar.length === 0 ? (
                <div className="text-center py-14 border border-slate-200 rounded-xl bg-white">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        +
                    </div>
                    <p className="text-slate-700 font-medium mt-3">Henüz ilan yok</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Yukarıdaki butondan ilk ilanı oluşturabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ilanlar.map((ilan) => (
                        <div
                            key={ilan.id}
                            className="group bg-white border border-slate-200 rounded-xl p-5 transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">{ilan.pozisyon}</h2>
                                    <span className="inline-block text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5 mt-1.5">
                                        {ilan.departman}
                                    </span>
                                </div>
                                <span
                                    className={
                                        ilan.durum === 'ACIK'
                                            ? 'shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                            : 'shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-500/20'
                                    }
                                >
                                    <span
                                        className={
                                            ilan.durum === 'ACIK'
                                                ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                                                : 'h-1.5 w-1.5 rounded-full bg-slate-400'
                                        }
                                    />
                                    {ilan.durum === 'ACIK' ? 'Açık' : 'Kapalı'}
                                </span>
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
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                                >
                                    {ilan.durum === 'ACIK' ? 'İlanı kapat' : 'İlanı aç'}
                                </button>

                                {adminMi && (
                                    <button
                                        onClick={() => ilanSil(ilan)}
                                        disabled={islemYapilan === ilan.id}
                                        className="text-sm border border-slate-200 text-slate-500 rounded-lg px-3 py-1.5 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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