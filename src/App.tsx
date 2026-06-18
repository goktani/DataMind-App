import React, { useState, useEffect } from "react";
import { ColumnDef, VeriOzetiMetadata } from "./types";
import { templates } from "./data";
import { columnsToMetadata } from "./utils";
import { MetadataForm } from "./components/MetadataForm";
import { NotebookViewer } from "./components/NotebookViewer";
import { 
  Cpu, 
  Sparkles, 
  Settings, 
  FileCode, 
  CheckCircle, 
  Play, 
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sliders,
  HelpCircle
} from "lucide-react";

export default function App() {
  // Preset templates mapping
  const [selectedPreset, setSelectedPreset] = useState<number>(0);

  // Core metadata state
  const [toplamSatir, setToplamSatir] = useState<number>(templates[0].metadata.toplam_satir);
  const [columnsList, setColumnsList] = useState<ColumnDef[]>([]);
  const [customDemand, setCustomDemand] = useState<string>(templates[0].customDemand);

  // Generator states
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Immersive loading logger index
  const [logIndex, setLogIndex] = useState(0);

  const mockLogs = [
    "⚡ Gemini 3.5 Flash bağlantısı kuruluyor...",
    "🔍 Kolon tipleri ve eksik değer sayımları analiz ediliyor...",
    "🧠 Keşifsel Veri Analizi felsefesi tanımlanıyor...",
    "📊 Plotly Dark temalı 4 gelişmiş grafik tasarlanıyor...",
    "🛡️ Kategorik renk skalası hatasını önleyici pd.Categorical kodları tasarlanıyor...",
    "✨ Kritik istatistiki bulgular zümrüt rengi tagler içerisine yerleştiriliyor...",
    "📝 Python ve Pandas kütüphane importları hücrelere ayrılıyor...",
    "📓 Jupyter Notebook formatında hücre hiyerarşisi oluşturuluyor...",
  ];

  // Helper to sync columns from a predefined template
  const handleLoadTemplate = (idx: number) => {
    setSelectedPreset(idx);
    const template = templates[idx];
    setToplamSatir(template.metadata.toplam_satir);
    setCustomDemand(template.customDemand);
    
    // Map record structures back to ColumnDef
    const cols: ColumnDef[] = template.metadata.kolonlar.map(c => ({
      name: c,
      type: (template.metadata.veri_tipleri[c] || "object") as ColumnDef["type"],
      missingCount: template.metadata.eksik_degerler[c] || 0,
    }));
    setColumnsList(cols);
    setErrorMessage(null);
  };

  // Run on first load to fetch initial default
  useEffect(() => {
    handleLoadTemplate(0);
  }, []);

  // Interval logger trigger during load
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLogIndex(0);
      interval = setInterval(() => {
        setLogIndex(prev => (prev < mockLogs.length - 1 ? prev + 1 : prev));
      }, 1800);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Derived metadata computed JSON
  const metadataJson = columnsToMetadata(toplamSatir, columnsList);

  const handleGenerateEDA = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedMarkdown(null);

    try {
      const response = await fetch("/api/generate-eda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Veri_Ozeti_Metadata: metadataJson,
          Kullanici_Ozel_Talebi: customDemand,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setGeneratedMarkdown(data.markdown);
      } else {
        setErrorMessage(data.error || "Rapor üretimi başarısız oldu. API hatası.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Sunucu ile iletişim kurulamadı. API anahtarınızın Secrets panelinde tanımlı olduğundan emin olun."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentLog = mockLogs[logIndex];

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
      {/* Header bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-lg shadow-sm flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                  Auto-EDA Report Generator
                </span>
                <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                  AI v3.5
                </span>
              </div>
              <p className="text-xs text-slate-500">Jupyter Notebook (.ipynb) formatında profesyonel otomatik raporlayıcı</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-600 font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini Direct Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main body area */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT PANEL / CONTROLS - Col Span 5 */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col">
            
            {/* Presets Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-display font-bold text-xs text-slate-500 uppercase tracking-wider">Hızlı Başlangıç Şablonları</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {templates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadTemplate(idx)}
                    className={`text-left p-3 rounded-lg border text-xs transition cursor-pointer select-none ${
                      selectedPreset === idx
                        ? "bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium ring-1 ring-indigo-500/10"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="font-bold truncate text-slate-800">{template.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5 leading-normal">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* METADATA BUILDER FORM */}
            <MetadataForm
              toplamSatir={toplamSatir}
              setToplamSatir={setToplamSatir}
              columnsList={columnsList}
              setColumnsList={setColumnsList}
              metadataJson={metadataJson}
            />

            {/* CUSTOM USER REQUEST INPUT */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-display font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  2. Kullanıcı Özel Talebi (Kullanici_Ozel_Talebi)
                </h3>
              </div>

              <textarea
                className="w-full h-24 bg-slate-50 border border-slate-200 p-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition leading-relaxed resize-none"
                placeholder="Örn: Sadece departmanlar arası maaş dağılımına odaklan, eksik maaş verilerini temizle..."
                value={customDemand}
                onChange={(e) => setCustomDemand(e.target.value)}
              />

              {/* Suggestion pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Aykırı değer analizi eklensin",
                  "Eksik verileri silerek temizle",
                  "Correlation Matrix (Heatmap) çiz",
                  "Sunburst departman grafiği oluştur"
                ].map((pill, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      if (!customDemand.trim() || customDemand === "Sanal veri seti oluşturarak genel EDA incelemesi yap.") {
                        setCustomDemand(pill + ".");
                      } else {
                        setCustomDemand(prev => prev.trim().replace(/\.$/, "") + `, ${pill.toLowerCase()}.`);
                      }
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 hover:text-indigo-700 text-slate-600 border border-slate-200 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleGenerateEDA}
              disabled={isLoading || columnsList.length === 0}
              className="w-full relative group bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/10 overflow-hidden"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Gemini EDA Raporu Hazırlıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse text-indigo-200" />
                  <span>Jupyter Notebook (EDA Raporu) Üret</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>

            {/* Error alerts */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-250 rounded-xl p-4 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 leading-relaxed font-semibold">
                  {errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL / DISPLAY - Col Span 7 */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col items-stretch h-full min-h-[500px]">
            {isLoading ? (
              /* PROGRESS COMPILATION LOADER */
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full flex-grow space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                  <div className="absolute w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <h4 className="font-display font-semibold text-slate-800 tracking-tight text-sm">Notebook Hazırlanıyor...</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Seçilen kolon tanımları, eksik veri oranları ve özel talepleriniz doğrultusunda Jupyter hücreleri derleniyor.
                  </p>
                </div>

                {/* Simulated live progress logger */}
                <div className="w-full max-w-sm bg-slate-900 border border-slate-950 p-4 rounded-lg font-mono text-left space-y-2">
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1.5 uppercase font-bold tracking-wider">
                    <span>⚡ AI Compiler Terminal</span>
                    <span className="text-emerald-400 font-normal animate-pulse font-mono">Running</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium transition-all duration-300 leading-relaxed min-h-12 py-1 font-mono">
                    {currentLog}
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, Math.max(10, ((logIndex + 1) / mockLogs.length) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : generatedMarkdown ? (
              /* RENDER JUPYTER NOTEBOOK VIEWER */
              <div className="flex-1 h-full min-h-[600px]">
                <NotebookViewer markdown={generatedMarkdown} />
              </div>
            ) : (
              /* WELCOME / PLACEHOLDER SCREEN */
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full flex-grow space-y-6 shadow-sm">
                <div className="bg-indigo-50 p-4 rounded-full border border-indigo-100">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h4 className="font-display font-bold text-slate-800 tracking-tight">Akıllı EDA Analiz Hücresi</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sol panelden veri kolonlarınızı ayarlayıp taleplerinizi girin. Gemini, veri mühendisliği standartlarına uygun <strong className="text-indigo-600 font-semibold">Plotly Dark</strong> grafiklerle donatılmış bir notebook sunacaktır.
                  </p>
                </div>

                {/* Informative Grid of features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full pt-2">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <span className="text-xs font-semibold text-indigo-700 block mb-1">Plotly_Dark Görselleştirme</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Seçilen kolona en uyumlu 3D, Violin, Sunburst veya Heatmap grafikleri hazır olarak entegre edilir.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <span className="text-xs font-semibold text-indigo-700 block mb-1">Hata Önleme Sezgisi</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Kategorik verilerin continuous scale hatasını engellemek için kod seviyesinde otomatik dönüşümler uygulanır.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <span className="text-xs font-semibold text-indigo-700 block mb-1">Zümrüt Renkli Analizler</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Sonuç raporunun en kritik tüyoları ve istatistik tahminleri belirgin renklerle vurgulanır.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <span className="text-xs font-semibold text-indigo-700 block mb-1">Gerçek `.ipynb` Aktarımı</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">İndirilen dosya doğrudan yerel VS Code veya Google Jupyter arabiriminde kod olarak koşturulabilir.</span>
                  </div>
                </div>

                {/* Instant load test data button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateEDA}
                    className="bg-indigo-50 border border-indigo-200 hover:border-indigo-350 hover:bg-indigo-100 text-indigo-700 font-semibold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>Hazır Şablon ile Hemen Test Et</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer credits block */}
      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-[11px] text-slate-500 bg-white">
        <p>© 2026 AI Auto-EDA Raporu Üretim Terminali. Google AI Studio ile güçlendirilmiştir.</p>
        <p className="mt-1">Tüm grafiklerde <span className="text-slate-700 font-semibold">plotly_dark</span> ve zümrüt özet vurgulaması standart ayarlıdır.</p>
      </footer>
    </div>
  );
}
