import { Link, useParams } from 'react-router-dom';
import KariyerDuzeni from '../components/KariyerDuzeni';

// P3'te doldurulacak: ilan detayi + basvuru formu (POST /api/public/basvuru).
// Simdilik rota calissin ve aday cikmaza girmesin diye yer tutucu.
export default function KariyerBasvuru() {
    const { ilanId } = useParams();

    return (
        <KariyerDuzeni>
            <Link
                to="/kariyer"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                ← Açık pozisyonlar
            </Link>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="font-medium text-slate-700">Başvuru formu yakında</p>
                <p className="mt-1 text-sm text-slate-500">
                    Bu pozisyon için başvuru alma özelliği henüz hazır değil. (İlan #{ilanId})
                </p>
            </div>
        </KariyerDuzeni>
    );
}
