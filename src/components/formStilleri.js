// Formlarda tekrar eden Tailwind siniflari. Bilesen degil, sinif sabiti:
// mevcut JSX yapisini bozmadan tum sayfalarda ayni girdi/buton dilini verir.

export const ETIKET = 'block text-sm font-medium text-slate-700 mb-1.5';

export const GIRDI =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 ' +
    'transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

export const SECIM = `${GIRDI} bg-white`;

// Arac cubuklarindaki daha alcak girdiler (tablo ustu arama gibi)
export const GIRDI_KUCUK =
    'rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 ' +
    'transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

export const BUTON_BIRINCIL =
    'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition ' +
    'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ' +
    'disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none';

export const BUTON_IKINCIL =
    'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition ' +
    'hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

// Yikici eylem: sakin dursun, ancak uzerine gelince kirmiziya donsun
export const BUTON_TEHLIKE =
    'rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition ' +
    'hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 ' +
    'disabled:cursor-not-allowed disabled:opacity-50';
