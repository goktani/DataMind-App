import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemni client initialization to prevent crashing if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for generating EDA Jupyter Notebook instructions in Markdown
app.post("/api/generate-eda", async (req, res) => {
  try {
    const { Veri_Ozeti_Metadata, Kullanici_Ozel_Talebi } = req.body;

    if (!Veri_Ozeti_Metadata) {
      res.status(400).json({ error: "Veri_Ozeti_Metadata parametresi zorunludur." });
      return;
    }

    const ai = getAiClient();

    const systemInstruction = 
      "Sen, veri bilimciler için otomatik Keşifsel Veri Analizi (EDA) raporları üreten yapay zeka destekli bir uygulamanın (Auto-EDA App) çekirdek zekasısın. " +
      "Görevin, kullanıcıdan gelen CSV veri özetini (metadata) analiz edip, doğrudan çalıştırılabilir, profesyonel bir Jupyter Notebook (.ipynb) içeriğini Markdown formatında üretmektir. " +
      "\n\n" +
      "[UYGULAMA ÇIKTI KURALLARI - KESİN KISITLAMALAR]\n" +
      "1. Çıktı SADECE Markdown formatında olmalıdır. JSON veya Notebook formatında (.ipynb dosyası yapısında) yanıt VERME.\n" +
      "2. Hiyerarşi KESİNLİKLE şu düzende olmalıdır: <Ana HTML Başlık> -> Renkli Açıklama Metni -> ```python kod ``` -> Renkli Açıklama Metni -> ```python kod ``` şeklinde olmalıdır.\n" +
      "3. Tüm ana konu başlıkları <h2 style=\"color: #E74C3C;\">...</h2> gibi estetik HTML etiketleriyle yazılmalıdır.\n" +
      "4. Açıklama metinleri içindeki kritik veriler ve istatistikler <span style=\"color: #27AE60; font-weight: bold;\">renkli ve kalın</span> vurgulanmalıdır.\n" +
      "\n" +
      "[VERİ GÖRSELLEŞTİRME VE PLOTLY KURALLARI]\n" +
      "1. Kullanıcının 'Özel Talebi' varsa grafikleri bu talebe göre şekillendir. Yoksa veriye en uygun 4 gelişmiş sürpriz grafiği (Sunburst, Heatmap, 3D Scatter, Violin vb.) kendin seç.\n" +
      "2. Her grafikte KESİNLİKLE 'plotly_dark' temasını kullan.\n" +
      "3. KRİTİK: Eğer `px.parallel_categories` veya renk skalası (color_continuous_scale) kullanan bir grafik çizeceksen ve 'color' parametresine kategorik (string) bir kolon atayacaksan, KESİNLİKLE grafiği çizmeden hemen önce `pd.Categorical(df['KolonAdı']).codes` kullanarak o kolonu sayısallaştır! (Aksi takdirde Plotly ValueError verir).\n" +
      "\n" +
      "Lütfen kullanıcının diline ve tonuna (Türkçe) son derece profesyonel, vizyoner bir şekilde uyum sağla. " +
      "Kod blokları eksiksiz, kopyalanıp yapıştırıldığında doğrudan çalışabilir Python kodları olmalıdır (veri yükleme aşamaları ve kütüphane importları da dahil)." +
      "EDA raporunda veri yüklemesini veya oluşturulmasını (örneğin Pandas ile sanal veri seti oluşturmak veya CSV okumak) uygun şekilde göster.";

    const promptText = `
Lütfen aşağıdaki Veri Özeti (Metadata) ve Kullanıcı Özel Talebi bilgilerini kullanarak detaylı, profesyonel bir EDA Notebook içeriği üret:

[VERİ ÖZETİ (METADATA)]:
${typeof Veri_Ozeti_Metadata === 'object' ? JSON.stringify(Veri_Ozeti_Metadata, null, 2) : Veri_Ozeti_Metadata}

[KULLANICI ÖZEL TALEBİ]:
${Kullanici_Ozel_Talebi || "Belirtilmedi (Veriye en uygun 4 gelişmiş görselleştirme ve temel EDA adımlarını seç.)"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const markdownOutput = response.text || "";
    res.json({ success: true, markdown: markdownOutput });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "EDA generation failed." });
  }
});

// Setup Vite Dev server or static asset serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
