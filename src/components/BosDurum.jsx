export default function BosDurum({ simge = '+', baslik, aciklama, cerceveli = true }) {
    return (
        <div
            className={`py-14 text-center ${
                cerceveli ? 'rounded-xl border border-slate-200 bg-white shadow-sm' : ''
            }`}
        >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {simge}
            </div>
            <p className="mt-3 font-medium text-slate-700">{baslik}</p>
            {aciklama && <p className="mt-1 text-sm text-slate-500">{aciklama}</p>}
        </div>
    );
}
