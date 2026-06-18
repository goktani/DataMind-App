import { PredefinedTemplate } from "./types";

export const templates: PredefinedTemplate[] = [
  {
    title: "Departman Maaş Dağılımı (Örnek)",
    description: "Departmanlar arası maaş karşılaştırması ve eksik verilerin temizlenmesi odağında EDA.",
    customDemand: "Sadece departmanlar arası maaş dağılımına odaklan, eksik maaş verilerini temizle.",
    metadata: {
      toplam_satir: 1000,
      kolonlar: ["Departman", "Maas", "Deneyim_Yili"],
      veri_tipleri: {
        Departman: "object",
        Maas: "int64",
        Deneyim_Yili: "int64"
      },
      eksik_degerler: {
        Departman: 0,
        Maas: 15,
        Deneyim_Yili: 0
      }
    }
  },
  {
    title: "E-Ticaret Müşteri Harcamaları",
    description: "Harcama alışkanlıkları, demografik kırılımlar ve Churn korelasyon analizi.",
    customDemand: "Müşteri harcama skoru ve yaş arasındaki ilişkiyi Scatter plot ile göster, Churn durumuna göre renklendir ve violin grafik ekle.",
    metadata: {
      toplam_satir: 5000,
      kolonlar: ["Musteri_ID", "Yas", "Harcama_Skoru", "Son_Satin_Alma_Gun", "Churn_Durumu"],
      veri_tipleri: {
        Musteri_ID: "object",
        Yas: "int64",
        Harcama_Skoru: "int64",
        Son_Satin_Alma_Gun: "int64",
        Churn_Durumu: "bool"
      },
      eksik_degerler: {
        Musteri_ID: 0,
        Yas: 25,
        Harcama_Skoru: 0,
        Son_Satin_Alma_Gun: 12,
        Churn_Durumu: 0
      }
    }
  },
  {
    title: "Zaman Serisi Mağaza Satışları",
    description: "Tarih bazlı satış trendleri, kategori performansları ve dönemsel dalgalanmalar.",
    customDemand: "Zaman serisi trendini çizdir, mevsimselliği incele ve kampanya dönemi satış değişimlerini görselleştir.",
    metadata: {
      toplam_satir: 365,
      kolonlar: ["Tarih", "Satis_Miktari", "Urun_Kategorisi", "Kampanya_Durumu"],
      veri_tipleri: {
        Tarih: "datetime64[ns]",
        Satis_Miktari: "float64",
        Urun_Kategorisi: "object",
        Kampanya_Durumu: "bool"
      },
      eksik_degerler: {
        Tarih: 0,
        Satis_Miktari: 5,
        Urun_Kategorisi: 0,
        Kampanya_Durumu: 0
      }
    }
  },
  {
    title: "Emlak/Konut Fiyat Analizi",
    description: "Metrekare, oda sayısı ve bina yaşı faktörlerinin ev fiyatlarına olan etkisi.",
    customDemand: "Ev fiyatlarını etkileyen ana faktörleri Korelasyon Matrisi (Heatmap) ve gelişmiş bir 3D Scatter ile görselleştir.",
    metadata: {
      toplam_satir: 2500,
      kolonlar: ["Ev_M2", "Oda_Sayisi", "Konum", "Fiyat", "Bina_Yasi"],
      veri_tipleri: {
        Ev_M2: "int64",
        Oda_Sayisi: "int64",
        Konum: "object",
        Fiyat: "float64",
        Bina_Yasi: "int64"
      },
      eksik_degerler: {
        Ev_M2: 0,
        Oda_Sayisi: 0,
        Konum: 42,
        Fiyat: 10,
        Bina_Yasi: 0
      }
    }
  }
];
