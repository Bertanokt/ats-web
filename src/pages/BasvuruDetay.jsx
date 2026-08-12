import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Kart from '../components/Kart';
import Avatar from '../components/Avatar';
import AsamaRozeti from '../components/AsamaRozeti';
import Rozet from '../components/Rozet';
import { tarihYaz, tarihSaatYaz } from '../utils/tarih';
import { SECIM_DAR, GIRDI, BUTON_BIRINCIL, BUTON_TEHLIKE } from '../components/formStilleri';

const TIP_ADI = {
    NOT: 'Not',
    GORUSME: 'Görüşme',
    DEGERLENDIRME: 'Değerlendirme',
};

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
        return (
            <div>
                <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                <div className="mt-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                    <div>
                        <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
                        <div className="mt-2 h-3 w-64 rounded bg-slate-100 animate-pulse" />
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="h-56 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    <div className="h-56 rounded-xl border border-slate-200 bg-white animate-pulse lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (hata && !basvuru) {
        return (
            <div>
                <Link
                    to="/basvurular"
                    className="text-sm text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                    ← Başvurulara dön
                </Link>
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">{hata}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Ust satir */}
            <div>
                <Link
                    to="/basvurular"
                    className="text-sm text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                    ← Başvurulara dön
                </Link>

                <div className="mt-3 flex items-start gap-3">
                    <Avatar ad={basvuru.aday.adSoyad} boyut="xl" />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {basvuru.aday.adSoyad}
                            </h1>
                            <AsamaRozeti asama={basvuru.asama} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            {basvuru.ilan.pozisyon} · {basvuru.ilan.departman} ·{' '}
                            {tarihYaz(basvuru.basvuruTarihi)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Islem hatasi (asama ilerletme / eleme) */}
            {hata && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{hata}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Sol sutun */}
                <div className="space-y-4">

                    {basvuru.asama !== 'ISE_ALINDI' && basvuru.asama !== 'ELENDI' && (
                        <Kart>
                            <h2 className="mb-3 font-semibold text-slate-900">İşlemler</h2>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={asamaIlerlet}
                                    disabled={islemYapiliyor}
                                    className={BUTON_BIRINCIL}
                                >
                                    {islemYapiliyor ? 'İşleniyor...' : 'Sonraki aşamaya geçir'}
                                </button>
                                <button
                                    onClick={adayEle}
                                    disabled={islemYapiliyor}
                                    className={`${BUTON_TEHLIKE} py-2`}
                                >
                                    Ele
                                </button>
                            </div>
                        </Kart>
                    )}

                    <Kart>
                        <h2 className="mb-3 font-semibold text-slate-900">Aday</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-slate-500">E-posta</dt>
                                <dd className="mt-0.5 break-words text-slate-800">
                                    {basvuru.aday.email}
                                </dd>
                            </div>
                            {basvuru.aday.telefon && (
                                <div>
                                    <dt className="text-xs text-slate-500">Telefon</dt>
                                    <dd className="mt-0.5 text-slate-800 tabular-nums">
                                        {basvuru.aday.telefon}
                                    </dd>
                                </div>
                            )}
                            {basvuru.aday.ozet && (
                                <div>
                                    <dt className="text-xs text-slate-500">Özet</dt>
                                    <dd className="mt-0.5 text-slate-700">{basvuru.aday.ozet}</dd>
                                </div>
                            )}
                        </dl>
                    </Kart>

                    {uyum && (
                        <Kart>
                            <div className="mb-3 flex items-baseline justify-between">
                                <h2 className="font-semibold text-slate-900">Uyum skoru</h2>
                                <span className="text-2xl font-bold tabular-nums text-slate-900">
                                    %{uyum.skor}
                                </span>
                            </div>

                            <div
                                className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100"
                                role="progressbar"
                                aria-valuenow={uyum.skor}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="Uyum skoru"
                            >
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-[width] duration-700 ease-out"
                                    style={{ width: `${uyum.skor}%` }}
                                />
                            </div>

                            {uyum.eslesenler.length > 0 && (
                                <div className="mb-3">
                                    <p className="mb-1.5 text-xs text-slate-500">Eşleşen</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uyum.eslesenler.map((y) => (
                                            <Rozet key={y} ton="yesil" nokta={false}>
                                                {y}
                                            </Rozet>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uyum.eksikler.length > 0 && (
                                <div>
                                    <p className="mb-1.5 text-xs text-slate-500">Eksik</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uyum.eksikler.map((y) => (
                                            <Rozet key={y} ton="notr" nokta={false}>
                                                {y}
                                            </Rozet>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Kart>
                    )}
                </div>

                {/* Sag sutun */}
                <Kart className="lg:col-span-2">
                    <h2 className="mb-4 font-semibold text-slate-900">
                        Aktivite geçmişi
                        <span className="ml-2 font-normal text-slate-400 tabular-nums">
                            {basvuru.aktiviteler.length}
                        </span>
                    </h2>

                    <form onSubmit={aktiviteEkle} className="mb-4 space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={aktiviteForm.tip}
                                onChange={(e) => setAktiviteForm({ ...aktiviteForm, tip: e.target.value })}
                                aria-label="Aktivite tipi"
                                className={SECIM_DAR}
                            >
                                <option value="NOT">Not</option>
                                <option value="GORUSME">Görüşme</option>
                                <option value="DEGERLENDIRME">Değerlendirme</option>
                            </select>

                            {aktiviteForm.tip === 'DEGERLENDIRME' && (
                                <select
                                    value={aktiviteForm.puan}
                                    onChange={(e) =>
                                        setAktiviteForm({ ...aktiviteForm, puan: Number(e.target.value) })
                                    }
                                    aria-label="Değerlendirme puanı"
                                    className={SECIM_DAR}
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
                            aria-label="Aktivite içeriği"
                            className={GIRDI}
                        />

                        {aktiviteHata && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {aktiviteHata}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={aktiviteKaydediliyor}
                            className={BUTON_BIRINCIL}
                        >
                            {aktiviteKaydediliyor ? 'Ekleniyor...' : 'Aktivite ekle'}
                        </button>
                    </form>

                    {basvuru.aktiviteler.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Henüz aktivite kaydı yok.
                        </p>
                    ) : (
                        <ol className="space-y-4">
                            {basvuru.aktiviteler.map((a) => (
                                <li key={a.id} className="relative border-l-2 border-slate-200 pl-4">
                                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-300" />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-slate-600">
                                            {TIP_ADI[a.tip]}
                                        </span>
                                        {a.puan != null && (
                                            <Rozet ton="amber" nokta={false}>
                                                {a.puan}/5
                                            </Rozet>
                                        )}
                                        <span className="ml-auto text-xs text-slate-400 tabular-nums">
                                            {tarihSaatYaz(a.tarih)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-800">{a.icerik}</p>
                                </li>
                            ))}
                        </ol>
                    )}
                </Kart>
            </div>
        </div>
    );
}
