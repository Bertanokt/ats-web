import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const ASAMA_ADI = {
    BASVURU: 'Başvuru',
    ON_ELEME: 'Ön Eleme',
    MULAKAT: 'Mülakat',
    TEKLIF: 'Teklif',
    ISE_ALINDI: 'İşe Alındı',
    ELENDI: 'Elendi',
};

const ASAMA_RENGI = {
    BASVURU: 'bg-gray-100 text-gray-700',
    ON_ELEME: 'bg-blue-100 text-blue-700',
    MULAKAT: 'bg-purple-100 text-purple-700',
    TEKLIF: 'bg-amber-100 text-amber-700',
    ISE_ALINDI: 'bg-green-100 text-green-700',
    ELENDI: 'bg-red-100 text-red-700',
};

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

    if (yukleniyor) {
        return <p className="text-gray-500">Yükleniyor...</p>;
    }

    const acikIlanlar = ilanlar.filter((i) => i.durum === 'ACIK');

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Başvurular</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{basvurular.length} başvuru</span>
                    <button
                        onClick={() => setFormAcik(!formAcik)}
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
                    >
                        {formAcik ? 'Vazgeç' : '+ Yeni başvuru'}
                    </button>
                </div>
            </div>

            {formAcik && (
                <form onSubmit={basvuruOlustur} className="bg-white border rounded-lg p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aday</label>
                            <select
                                value={secilenAday}
                                onChange={(e) => setSecilenAday(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2 bg-white"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                İlan <span className="text-gray-400 font-normal">(yalnızca açık ilanlar)</span>
                            </label>
                            <select
                                value={secilenIlan}
                                onChange={(e) => setSecilenIlan(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2 bg-white"
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
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
                            {formHata}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {kaydediliyor ? 'Oluşturuluyor...' : 'Başvuru oluştur'}
                    </button>
                </form>
            )}

            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{hata}</p>
                    <button
                        onClick={hepsiniGetir}
                        className="mt-2 text-sm border border-red-300 rounded px-3 py-1 hover:bg-red-100"
                    >
                        Tekrar dene
                    </button>
                </div>
            )}

            {basvurular.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border rounded-lg bg-white">
                    <p>Henüz başvuru yok.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {basvurular.map((basvuru) => (
                        <Link
                            key={basvuru.id}
                            to={`/basvurular/${basvuru.id}`}
                            className="block bg-white border rounded-lg p-4 hover:border-blue-400"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-medium text-gray-900">{basvuru.adSoyad}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {basvuru.ilanPozisyon}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {basvuru.basvuruTarihi}
                                        {basvuru.aktiviteSayisi > 0 && ` · ${basvuru.aktiviteSayisi} aktivite`}
                                    </p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${ASAMA_RENGI[basvuru.asama]}`}>
                                       {ASAMA_ADI[basvuru.asama]}
                             </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}