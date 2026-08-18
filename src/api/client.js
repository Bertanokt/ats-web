const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// --- Token'i localStorage'dan oku ---
function tokenAl() {
    const kayitli = localStorage.getItem('ats_kullanici');
    if (!kayitli) return null;
    try {
        return JSON.parse(kayitli).token;
    } catch {
        return null;
    }
}

// ham=true ise cevap JSON olarak cozumlenmez, Blob dondurulur (PDF gibi ikili icerik).
async function istek(yol, secenekler = {}, ham = false) {
    const token = tokenAl();

    // Mevcut basliklarin uzerine Authorization ekle
    const basliklar = { ...secenekler.headers };
    if (token) {
        basliklar['Authorization'] = `Bearer ${token}`;
    }

    const cevap = await fetch(`${BASE_URL}${yol}`, {
        ...secenekler,
        headers: basliklar,
    });

    // 401: token gecersiz veya suresi dolmus -> otomatik cikis
    if (cevap.status === 401) {
        localStorage.removeItem('ats_kullanici');
        window.location.href = '/giris';
        throw new Error('Oturumunuz sona erdi, tekrar giris yapin');
    }

    if (!cevap.ok) {
        let mesaj = `Hata: ${cevap.status}`;
        try {
            const hata = await cevap.json();
            if (hata.mesaj) mesaj = hata.mesaj;
        } catch {
            // JSON degilse varsayilan mesaji kullan
        }
        // Durum kodu da tasiniyor: cagiran taraf 404 ile 400'u ayirt edebilsin
        const hataNesnesi = new Error(mesaj);
        hataNesnesi.durum = cevap.status;
        throw hataNesnesi;
    }

    if (ham) return cevap.blob();

    // Govdesi olmayan cevaplar (DELETE gibi) icin
    const metin = await cevap.text();
    if (!metin) return null;
    return JSON.parse(metin);
}

export const api = {
    get: (yol) => istek(yol),

    post: (yol, veri) =>
        istek(yol, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veri),
        }),

    put: (yol, veri) =>
        istek(yol, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veri),
        }),

    del: (yol) => istek(yol, { method: 'DELETE' }),

    postParam: (yol) => istek(yol, { method: 'POST' }),

    upload: (yol, dosya) => {
        const form = new FormData();
        form.append('dosya', dosya);
        return istek(yol, { method: 'POST', body: form });
    },

    // Ikili icerigi Blob olarak getirir. Tarayicinin kendi <a href> istegi
    // Authorization basligi tasimadigi icin korumali dosyalar boyle alinir.
    indir: (yol) => istek(yol, {}, true),

    // Dosya + metin alanlarini birlikte gonderir (multipart).
    // Content-Type bilerek yazilmiyor: multipart sinir (boundary) degerini
    // tarayici uretir, elle yazilirsa istek bozulur.
    gonderForm: (yol, alanlar) => {
        const form = new FormData();
        Object.entries(alanlar).forEach(([ad, deger]) => {
            // Bos birakilan istege bagli alanlar hic gonderilmesin
            if (deger !== null && deger !== undefined && deger !== '') {
                form.append(ad, deger);
            }
        });
        return istek(yol, { method: 'POST', body: form });
    },
};