import { TONLAR } from '../utils/rozetTonlari';

// Noktali pill rozet.
export default function Rozet({ ton = 'notr', nokta = true, children, className = '' }) {
    const stil = TONLAR[ton] ?? TONLAR.notr;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${stil.kutu} ${className}`}
        >
            {nokta && <span className={`h-1.5 w-1.5 rounded-full ${stil.nokta}`} />}
            {children}
        </span>
    );
}
