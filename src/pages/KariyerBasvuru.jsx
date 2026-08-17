import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import KariyerDuzeni from '../components/KariyerDuzeni';
import { ETIKET, GIRDI, BUTON_BIRINCIL } from '../components/formStilleri';

const MAKS_BOYUT = 5 * 1024 * 1024; // sunucudaki sinirla ayni

function boyutYaz(bayt) {
    if (bayt < 1024 * 1024) return `${(bayt / 1024).toFixed(0)} KB`;
    return `${(bayt / (1024 * 1024)).toFixed(1)} MB`;
}

function GeriBaglanti() {
    return (
        <Link
            to="/kariyer"
            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            Açık pozisyonlar
        </Link>
    );
}

export default function KariyerBasvuru() {
    const { ilanId } = useParams();

    const [ilan, setIlan] = useState(null);
    const [ilanYukleniyor, setIlanYukleniyor] = useState(true);
    const [ilanHata, setIlanHata] = useState(null);

    const [form, setForm] = useState({ adSoyad: '', email: '', telefon: '', not: '' });
    const [cv, setCv] = useState(null);
    const [dosyaHata, setDosyaHata] = useState(null);

    const [gonderiliyor, setGonderiliyor] = useState(false);
    const [gonderimHata, setGonderimHata] = useState(null);
    const [sonuc, setSonuc] = useState(null);

    useEffect(() => {
        let iptal = false;

        api.get(`/api/public/ilanlar/${ilanId}`)
            .then((veri) => {
                if (!iptal) setIlan(veri);
            })
            .catch((err) => {
                if (!iptal) setIlanHata({ mesaj: err.message, durum: err.durum });
            })
            .finally(() => {
                if (!iptal) setIlanYukleniyor(false);
            });

        return () => {
            iptal = true;
        };
    }, [ilanId]);

    function alanDegis(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    // Istemci tarafi kontrol yalnizca hizli geri bildirim icindir;
    // sunucu ayni kurallari bagimsiz olarak tekrar uygular.
    function cvSecildi(e) {
        const dosya = e.target.files[0];
        setDosyaHata(null);

        if (!dosya) {
            setCv(null);
            return;
        }
        const pdfMi =
            dosya.type === 'application/pdf' || dosya.name.toLowerCase().endsWith('.pdf');
        if (!pdfMi) {
            setCv(null);
            e.target.value = '';
            setDosyaHata('Yalnızca PDF dosyası yükleyebilirsiniz.');
            return;
        }
        if (dosya.size > MAKS_BOYUT) {
            setCv(null);
            e.target.value = '';
            setDosyaHata(`Dosya en fazla 5 MB olabilir. Seçtiğiniz dosya ${boyutYaz(dosya.size)}.`);
            return;
        }
        setCv(dosya);
    }

    async function gonder(e) {
        e.preventDefault();

        if (!cv) {
            setDosyaHata('Başvuru için CV dosyanızı eklemeniz gerekiyor.');
            return;
        }

        setGonderiliyor(true);
        setGonderimHata(null);
        try {
            const cevap = await api.gonderForm('/api/public/basvuru', {
                ilanId,
                adSoyad: form.adSoyad,
                email: form.email,
                telefon: form.telefon,
                not: form.not,
                cv,
            });
            setSonuc(cevap);
        } catch (err) {
            setGonderimHata(err.message);
        } finally {
            setGonderiliyor(false);
        }
    }

    // --- 1. Ilan yukleniyor ---
    if (ilanYukleniyor) {
        return (
            <KariyerDuzeni>
                <GeriBaglanti />
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                    <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="mt-4 h-3 w-full max-w-md animate-pulse rounded bg-slate-100" />
                </div>
                <div className="mt-4 h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
            </KariyerDuzeni>
        );
    }

    // --- 2. Ilan acilamadi (kapali / bulunamadi / diger) ---
    if (ilanHata) {
        const kapali = ilanHata.durum === 400;
        return (
            <KariyerDuzeni>
                <GeriBaglanti />
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        —
                    </div>
                    <h1 className="mt-4 text-lg font-semibold text-slate-900">
                        {kapali ? 'Bu pozisyon artık açık değil' : 'Bu ilana ulaşılamadı'}
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                        {kapali
                            ? 'İlan yayından kaldırılmış olabilir. Diğer açık pozisyonlara göz atabilirsiniz.'
                            : ilanHata.mesaj}
                    </p>
                    <Link
                        to="/kariyer"
                        className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        Açık pozisyonları gör
                    </Link>
                </div>
            </KariyerDuzeni>
        );
    }

    // --- 3. Tesekkur ekrani (form yerine gecer) ---
    if (sonuc) {
        return (
            <KariyerDuzeni>
                <GeriBaglanti />
                <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-600 ring-1 ring-emerald-600/20">
                        ✓
                    </div>
                    <h1 className="mt-4 text-xl font-semibold text-slate-900">Başvurunuz alındı</h1>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                        <span className="font-medium text-slate-900">{ilan.pozisyon}</span> pozisyonu
                        için başvurunuz bize ulaştı. İnceledikten sonra e-posta ile size dönüş
                        yapacağız.
                    </p>
                    {sonuc.basvuruId && (
                        <p className="mt-4 text-xs text-slate-400">
                            Başvuru numaranız:{' '}
                            <span className="font-medium tabular-nums text-slate-500">
                                #{sonuc.basvuruId}
                            </span>
                        </p>
                    )}
                    <Link
                        to="/kariyer"
                        className="mt-6 inline-block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        Diğer pozisyonlara dön
                    </Link>
                </div>
            </KariyerDuzeni>
        );
    }

    // --- 4. Ilan bilgisi + basvuru formu ---
    return (
        <KariyerDuzeni>
            <GeriBaglanti />

            {/* Ilan bilgisi */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {ilan.pozisyon}
                    </h1>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {ilan.departman}
                    </span>
                </div>

                {ilan.aciklama && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{ilan.aciklama}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                    {(ilan.nitelikler || '')
                        .split(',')
                        .map((n) => n.trim())
                        .filter(Boolean)
                        .map((nitelik) => (
                            <span
                                key={nitelik}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                                {nitelik}
                            </span>
                        ))}
                </div>
            </div>

            {/* Basvuru formu */}
            <form
                onSubmit={gonder}
                className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <h2 className="font-semibold text-slate-900">Başvuru formu</h2>
                <p className="mt-1 text-sm text-slate-500">
                    <span className="text-red-500">*</span> işaretli alanlar zorunludur.
                </p>

                <div className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="adSoyad" className={ETIKET}>
                            Ad Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="adSoyad"
                            name="adSoyad"
                            value={form.adSoyad}
                            onChange={alanDegis}
                            required
                            autoComplete="name"
                            className={GIRDI}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className={ETIKET}>
                            E-posta <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={alanDegis}
                            required
                            autoComplete="email"
                            placeholder="ornek@eposta.com"
                            className={GIRDI}
                        />
                        <p className="mt-1.5 text-xs text-slate-400">
                            Sürecin devamında size bu adresten ulaşacağız.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="telefon" className={ETIKET}>
                            Telefon{' '}
                            <span className="font-normal text-slate-400">(isteğe bağlı)</span>
                        </label>
                        <input
                            id="telefon"
                            name="telefon"
                            value={form.telefon}
                            onChange={alanDegis}
                            autoComplete="tel"
                            className={GIRDI}
                        />
                    </div>

                    {/* CV */}
                    <div>
                        <label htmlFor="cv" className={ETIKET}>
                            Özgeçmiş (PDF) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="cv"
                            type="file"
                            accept="application/pdf"
                            onChange={cvSecildi}
                            className="block w-full text-sm text-slate-600
                                       file:mr-3 file:rounded-lg file:border-0
                                       file:bg-blue-600 file:px-3 file:py-1.5
                                       file:text-sm file:font-medium file:text-white
                                       file:transition hover:file:bg-blue-700
                                       file:cursor-pointer"
                        />

                        {cv && !dosyaHata && (
                            <p className="mt-2 text-sm text-slate-600">
                                Seçilen dosya:{' '}
                                <span className="font-medium text-slate-900">{cv.name}</span>{' '}
                                <span className="text-slate-400">({boyutYaz(cv.size)})</span>
                            </p>
                        )}
                        {dosyaHata && (
                            <p className="mt-2 text-sm text-red-600">{dosyaHata}</p>
                        )}
                        {!cv && !dosyaHata && (
                            <p className="mt-1.5 text-xs text-slate-400">
                                PDF biçiminde, en fazla 5 MB.
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="not" className={ETIKET}>
                            Eklemek istedikleriniz{' '}
                            <span className="font-normal text-slate-400">(isteğe bağlı)</span>
                        </label>
                        <textarea
                            id="not"
                            name="not"
                            value={form.not}
                            onChange={alanDegis}
                            rows={3}
                            placeholder="Kendinizden kısaca bahsedebilirsiniz."
                            className={GIRDI}
                        />
                    </div>
                </div>

                {gonderimHata && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <p className="text-sm text-red-700">{gonderimHata}</p>
                    </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                    <button type="submit" disabled={gonderiliyor} className={BUTON_BIRINCIL}>
                        {gonderiliyor ? 'Gönderiliyor...' : 'Başvuruyu gönder'}
                    </button>
                    {gonderiliyor && (
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            Dosyanız yükleniyor
                        </span>
                    )}
                </div>
            </form>
        </KariyerDuzeni>
    );
}
