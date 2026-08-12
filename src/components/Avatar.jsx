const BOYUTLAR = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-base',
};

function basHarfler(adSoyad) {
    return (adSoyad || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parca) => parca[0])
        .join('')
        .toLocaleUpperCase('tr');
}

export default function Avatar({ ad, boyut = 'md', className = '' }) {
    return (
        <span
            title={ad}
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-500 ${BOYUTLAR[boyut]} ${className}`}
        >
            {basHarfler(ad)}
        </span>
    );
}
