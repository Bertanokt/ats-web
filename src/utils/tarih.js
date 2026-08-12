// Backend LocalDate ("2026-08-12") ve LocalDateTime ("2026-08-12T14:30:00") gonderir.
// new Date("2026-08-12") UTC gece yarisi olarak cozumlenir ve saat dilimine gore
// bir gun kayabilir; bu yuzden parcalari elle ayristiriyoruz.
function ayristir(deger) {
    if (!deger) return null;

    const [tarihKismi, saatKismi] = String(deger).split('T');
    const [yil, ay, gun] = tarihKismi.split('-').map(Number);
    if (!yil || !ay || !gun) return null;

    if (!saatKismi) return new Date(yil, ay - 1, gun);

    const [saat, dakika] = saatKismi.split(':').map(Number);
    return new Date(yil, ay - 1, gun, saat || 0, dakika || 0);
}

const GUN_AY_YIL = { day: 'numeric', month: 'short', year: 'numeric' };

// "2026-08-12" -> "12 Ağu 2026"
export function tarihYaz(deger) {
    const t = ayristir(deger);
    return t ? t.toLocaleDateString('tr-TR', GUN_AY_YIL) : '—';
}

// "2026-08-12T14:30:00" -> "12 Ağu 2026 14:30"
export function tarihSaatYaz(deger) {
    const t = ayristir(deger);
    if (!t) return '—';
    return t.toLocaleDateString('tr-TR', {
        ...GUN_AY_YIL,
        hour: '2-digit',
        minute: '2-digit',
    });
}
