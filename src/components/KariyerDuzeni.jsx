// Public kariyer sayfalarinin cercevesi.
// Yonetici panelindeki Layout bilerek kullanilmiyor: adayin gormesi gereken
// bir menu, kullanici adi veya cikis butonu yok.
export default function KariyerDuzeni({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-4">
                    <span className="flex h-8 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-sm font-bold tracking-tight text-white">
                        ATS
                    </span>
                    <span className="text-sm font-medium text-slate-500">Kariyer</span>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-3xl px-6 py-5 text-xs text-slate-400">
                    Başvurularınız yalnızca işe alım süreci kapsamında değerlendirilir.
                </div>
            </footer>
        </div>
    );
}
