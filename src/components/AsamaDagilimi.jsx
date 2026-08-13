import { TONLAR } from '../utils/rozetTonlari';
import { ASAMA_ADI, ASAMA_TONU } from '../utils/asama';

// Huni akisi. ELENDI bilerek disarida: bir asama degil, her asamadan
// olabilen bir cikis. Akisin icine konursa "Ise Alindi'dan sonraki adim"
// gibi okunuyor ki yanlis.
const AKIS = ['BASVURU', 'ON_ELEME', 'MULAKAT', 'TEKLIF', 'ISE_ALINDI'];

const PLOT_YUKSEKLIGI = 176;

// Eksen ucu her zaman tam sayi ve en buyuk degerin bir uzerinde baslar:
// boylece en yuksek sutun tavana yapismaz, "doluluk" yanilsamasi olusmaz.
// Veri buyudugunde cizgi sayisi 5'i gecmesin diye adim buyur.
function eksenHesapla(enBuyuk) {
    const tavan = Math.max(2, enBuyuk + 1);

    // Adim 1-2-5-10-20-50... dizisini izler: her olcekte yuvarlak cizgiler
    let adim = 1;
    while (tavan / adim > 4) {
        const us = Math.floor(Math.log10(adim));
        const taban = Math.round(adim / 10 ** us);
        if (taban === 1) adim = 2 * 10 ** us;
        else if (taban === 2) adim = 5 * 10 ** us;
        else adim = 10 ** (us + 1);
    }

    const ust = Math.ceil(tavan / adim) * adim;

    const cizgiler = [];
    for (let v = ust; v >= 0; v -= adim) cizgiler.push(v);
    return { ust, cizgiler };
}

export default function AsamaDagilimi({ dagilim }) {
    const say = (kod) => dagilim.find((d) => d.asama === kod)?.adet ?? 0;

    const sutunlar = AKIS.map((kod) => ({ kod, adet: say(kod) }));
    const elenen = say('ELENDI');
    const surecte = sutunlar.reduce((t, s) => t + s.adet, 0);

    const { ust, cizgiler } = eksenHesapla(Math.max(...sutunlar.map((s) => s.adet), 0));
    const yuzde = (adet) => (adet / ust) * 100;

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
            <div className="flex min-w-0 flex-1 gap-3">
                {/* Y ekseni degerleri */}
                <div className="relative w-5 shrink-0" style={{ height: PLOT_YUKSEKLIGI }}>
                    {cizgiler.map((v) => (
                        <span
                            key={v}
                            className="absolute right-0 translate-y-1/2 text-xs tabular-nums text-slate-400"
                            style={{ bottom: `${yuzde(v)}%` }}
                        >
                            {v}
                        </span>
                    ))}
                </div>

                <div className="min-w-0 flex-1">
                    {/* Plot alani */}
                    <div className="relative" style={{ height: PLOT_YUKSEKLIGI }}>
                        {/* Izgara: duz saç teli cizgiler, yuzeyden bir ton koyu */}
                        {cizgiler.map((v) => (
                            <div
                                key={v}
                                className={`absolute inset-x-0 border-t ${
                                    v === 0 ? 'border-slate-300' : 'border-slate-100'
                                }`}
                                style={{ bottom: `${yuzde(v)}%` }}
                            />
                        ))}

                        {/* Sutunlar. Genislik sinirli: kalin doygun bloklar yerine
                            ince isaretler, yuzey boslugu korunuyor. */}
                        <div className="absolute inset-0 flex items-end gap-3">
                            {sutunlar.map((s) => (
                                <div
                                    key={s.kod}
                                    className="group relative h-full flex-1"
                                    title={`${ASAMA_ADI[s.kod]}: ${s.adet} başvuru`}
                                >
                                    <div
                                        className={`absolute bottom-0 left-1/2 w-full max-w-11 -translate-x-1/2 rounded-t transition-[height] duration-700 ease-out ${
                                            TONLAR[ASAMA_TONU[s.kod]].nokta
                                        } group-hover:brightness-95`}
                                        style={{ height: `${yuzde(s.adet)}%` }}
                                    />
                                    <span
                                        className="absolute inset-x-0 text-center text-sm font-semibold tabular-nums text-slate-900"
                                        style={{ bottom: `calc(${yuzde(s.adet)}% + 6px)` }}
                                    >
                                        {s.adet}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* X ekseni etiketleri */}
                    <div className="mt-2 flex gap-2">
                        {sutunlar.map((s) => (
                            <span
                                key={s.kod}
                                className="flex-1 text-center text-xs leading-tight text-slate-500"
                            >
                                {ASAMA_ADI[s.kod]}
                            </span>
                        ))}
                    </div>

                    {/* Akis yonu */}
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                        süreç yönü →
                    </p>
                </div>
            </div>

            {/* Elendi akisin disinda: mekan olarak da grafigin disina alindi */}
            <div className="flex shrink-0 flex-col justify-center border-t border-slate-100 pt-4 lg:w-52 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 shrink-0 rounded-full ${TONLAR[ASAMA_TONU.ELENDI].nokta}`}
                    />
                    <span className="text-sm text-slate-600">Elendi</span>
                </div>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{elenen}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Süreçten çıktı. Hangi aşamada elendiği kayıtlarda tutulmadığı için akışa
                    dahil edilmiyor.
                </p>
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    Süreçte <span className="font-medium text-slate-600">{surecte}</span> başvuru
                </p>
            </div>
        </div>
    );
}
