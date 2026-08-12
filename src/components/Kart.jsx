export default function Kart({ children, className = '', dolgu = 'p-5', hoverli = false }) {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white shadow-sm ${dolgu} ${
                hoverli ? 'transition hover:border-slate-300 hover:shadow-md' : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}
