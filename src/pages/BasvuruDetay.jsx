import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const TIP_ADI = {
    NOT: 'Not',
    GORUSME: 'Görüşme',
    DEGERLENDIRME: 'Değerlendirme',
};

function tarihYaz(isoMetin) {
    const t = new Date(isoMetin);
    return t.toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function BasvuruDetay() {
    const { id } = useParams();

    const [basvuru, setBasvuru] = useState(null);
    const [uyum, setUyum] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState(null);

    const [islemYapiliyor, setIslemYapiliyor] = useState(false);
    const [aktiviteKaydediliyor, setAktiviteKaydediliyor] = useState(false);
    const [aktiviteHata, setAktiviteHata] = useState(null);
    const [aktiviteForm, setAktiviteForm] = useState({
        tip: 'NOT',
        icerik: '',
        puan: 3,
    });

    useEffect(() => {
        getir();
    }, [id]);

    async function getir() {
        setYukleniyor(true);
        setHata(null);
        try {
            const [b, u] = await Promise.all([
                api.get(`/api/basvurular/${id}`),
                api.get(`/api/basvurular/${id}/uyum`),
            ]);
            setBasvuru(b);
            setUyum(u);
        } catch (err) {
            setHata(err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    async function asamaIlerlet() {
        setIslemYapiliyor(true);
        setHata(null);
        try {
            await api.postParam(`/api/basvurular/${id}/ilerlet`);
            await getir();
        } catch (err) {
            setHata(err.message);
        } finally {
            setIslemYapiliyor(false);
        }
    }

    async function adayEle() {
        if (!window.confirm('Bu başvuruyu elemek istediğinize emin misiniz?')) return;

        setIslemYapiliyor(true);
        setHata(null);
        try {
            await api.postParam(`/api/basvurular/${id}/ele`);
            await getir();
        } catch (err) {
            setHata(err.message);
        } finally {
            setIslemYapiliyor(false);
        }
    }

    async function aktiviteEkle(e) {
        e.preventDefault();
        setAktiviteKaydediliyor(true);
        setAktiviteHata(null);
        try {
            const params = new URLSearchParams({
                tip: aktiviteForm.tip,
                icerik: aktiviteForm.icerik,
            });
            if (aktiviteForm.tip === 'DEGERLENDIRME') {
                params.set('puan', aktiviteForm.puan);
            }

            await api.postParam(`/api/basvurular/${id}/aktiviteler?${params}`);
            setAktiviteForm({ tip: 'NOT', icerik: '', puan: 3 });
            await getir();
        } catch (err) {
            setAktiviteHata(err.message);
        } finally {
            setAktiviteKaydediliyor(false);
        }
    }

    if (yukleniyor) {
        return <p className="text-gray-500">Yükleniyor...</p>;
    }

    if (hata && !basvuru) {
        return (
            <div>
                <Link to="/basvurular" className="text-sm text-blue-600 hover:underline">
                    ← Başvurulara dön
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                    <p className="text-red-700">{hata}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Ust satir */}
            <div>
                <Link to="/basvurular" className="text-sm text-blue-600 hover:underline">
                    ← Başvurulara dön
                </Link>
                <div className="flex items-center gap-3 mt-2">
                    <h1 className="text-2xl font-bold">{basvuru.aday.adSoyad}</h1>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ASAMA_RENGI[basvuru.asama]}`}>
                        {ASAMA_ADI[basvuru.asama]}
                    </span>
                </div>
                <p className="text-gray-500 mt-1">
                    {basvuru.ilan.pozisyon} · {basvuru.ilan.departman} · {basvuru.basvuruTarihi}
                </p>
            </div>

            {/* Islem hatasi (asama ilerletme / eleme) */}
            {hata && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-red-700 text-sm">{hata}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">

                {/* Sol sutun */}
                <div className="space-y-4">

                    {basvuru.asama !== 'ISE_ALINDI' && basvuru.asama !== 'ELENDI' && (
                        <div className="bg-white border rounded-lg p-4">
                            <h2 className="font-medium mb-3">İşlemler</h2>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={asamaIlerlet}
                                    disabled={islemYapiliyor}
                                    className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {islemYapiliyor ? 'İşleniyor...' : 'Sonraki aşamaya geçir'}
                                </button>
                                <button
                                    onClick={adayEle}
                                    disabled={islemYapiliyor}
                                    className="border border-red-200 text-red-600 rounded px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-50"
                                >
                                    Ele
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border rounded-lg p-4">
                        <h2 className="font-medium mb-3">Aday</h2>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-500">E-posta</dt>
                                <dd>{basvuru.aday.email}</dd>
                            </div>
                            {basvuru.aday.telefon && (
                                <div>
                                    <dt className="text-gray-500">Telefon</dt>
                                    <dd>{basvuru.aday.telefon}</dd>
                                </div>
                            )}
                            {basvuru.aday.ozet && (
                                <div>
                                    <dt className="text-gray-500">Özet</dt>
                                    <dd className="text-gray-700">{basvuru.aday.ozet}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {uyum && (
                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-baseline justify-between mb-3">
                                <h2 className="font-medium">Uyum skoru</h2>
                                <span className="text-2xl font-bold">%{uyum.skor}</span>
                            </div>

                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${uyum.skor}%` }}
                                />
                            </div>

                            {uyum.eslesenler.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1.5">Eşleşen</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uyum.eslesenler.map((y) => (
                                            <span key={y} className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">
                                                {y}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uyum.eksikler.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5">Eksik</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uyum.eksikler.map((y) => (
                                            <span key={y} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                                                {y}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sag sutun */}
                <div className="col-span-2 bg-white border rounded-lg p-4">
                    <h2 className="font-medium mb-4">
                        Aktivite geçmişi
                        <span className="text-gray-400 font-normal ml-2">
                            {basvuru.aktiviteler.length}
                        </span>
                    </h2>

                    <form onSubmit={aktiviteEkle} className="border-b pb-4 mb-4 space-y-3">
                        <div className="flex gap-2">
                            <select
                                value={aktiviteForm.tip}
                                onChange={(e) => setAktiviteForm({ ...aktiviteForm, tip: e.target.value })}
                                className="border rounded px-3 py-2 text-sm bg-white"
                            >
                                <option value="NOT">Not</option>
                                <option value="GORUSME">Görüşme</option>
                                <option value="DEGERLENDIRME">Değerlendirme</option>
                            </select>

                            {aktiviteForm.tip === 'DEGERLENDIRME' && (
                                <select
                                    value={aktiviteForm.puan}
                                    onChange={(e) => setAktiviteForm({ ...aktiviteForm, puan: Number(e.target.value) })}
                                    className="border rounded px-3 py-2 text-sm bg-white"
                                >
                                    {[1, 2, 3, 4, 5].map((p) => (
                                        <option key={p} value={p}>{p} puan</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <textarea
                            value={aktiviteForm.icerik}
                            onChange={(e) => setAktiviteForm({ ...aktiviteForm, icerik: e.target.value })}
                            required
                            rows={2}
                            placeholder="Not, görüşme özeti veya değerlendirme..."
                            className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {aktiviteHata && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
                                {aktiviteHata}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={aktiviteKaydediliyor}
                            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {aktiviteKaydediliyor ? 'Ekleniyor...' : 'Aktivite ekle'}
                        </button>
                    </form>

                    {basvuru.aktiviteler.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">
                            Henüz aktivite kaydı yok.
                        </p>
                    ) : (
                        <ol className="space-y-4">
                            {basvuru.aktiviteler.map((a) => (
                                <li key={a.id} className="border-l-2 border-gray-200 pl-4 relative">
                                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-600">
                                            {TIP_ADI[a.tip]}
                                        </span>
                                        {a.puan != null && (
                                            <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
                                                {a.puan}/5
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400 ml-auto">
                                            {tarihYaz(a.tarih)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mt-1">{a.icerik}</p>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
}