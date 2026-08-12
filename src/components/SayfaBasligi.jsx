// Uc listeleme sayfasinda ayni baslik + sayac + eylem duzeni.
// Eylem butonu children olarak gecirilir.
export default function SayfaBasligi({ baslik, sayac, children }) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{baslik}</h1>
                {sayac && <p className="mt-0.5 text-sm text-slate-500">{sayac}</p>}
            </div>
            {children}
        </div>
    );
}
