import { createContext, useContext, useState, useEffect } from 'react';

// 1. Context'i olustur
const AuthContext = createContext(null);

// 2. Saglayici bilesen: durumu tutar, altindaki her seye verir
export function AuthProvider({ children }) {
    const [kullanici, setKullanici] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);

    // Sayfa yenilendiginde localStorage'dan geri yukle
    useEffect(() => {
        const kayitli = localStorage.getItem('ats_kullanici');
        if (kayitli) {
            setKullanici(JSON.parse(kayitli));
        }
        setYukleniyor(false);
    }, []);

    function girisYap(veri) {
        // veri: {token, email, adSoyad, rol}
        localStorage.setItem('ats_kullanici', JSON.stringify(veri));
        setKullanici(veri);
    }

    function cikisYap() {
        localStorage.removeItem('ats_kullanici');
        setKullanici(null);
    }

    const deger = {
        kullanici,
        yukleniyor,
        girisYapildiMi: kullanici !== null,
        adminMi: kullanici?.rol === 'ADMIN',
        girisYap,
        cikisYap,
    };

    return <AuthContext.Provider value={deger}>{children}</AuthContext.Provider>;
}

// 3. Kolay erisim icin kisayol
export function useAuth() {
    return useContext(AuthContext);
}