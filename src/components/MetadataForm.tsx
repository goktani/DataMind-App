import React, { useState, useEffect } from "react";
import { ColumnDef, VeriOzetiMetadata } from "../types";
import { parseCSVMetadata, columnsToMetadata } from "../utils";
import { Plus, Trash, FileSpreadsheet, Edit3, Settings, Eye, Copy, Check, Info } from "lucide-react";

interface MetadataFormProps {
  toplamSatir: number;
  setToplamSatir: (v: number) => void;
  columnsList: ColumnDef[];
  setColumnsList: (cols: ColumnDef[]) => void;
  metadataJson: VeriOzetiMetadata;
}

export function MetadataForm({
  toplamSatir,
  setToplamSatir,
  columnsList,
  setColumnsList,
  metadataJson,
}: MetadataFormProps) {
  const [activeTab, setActiveTab] = useState<"csv" | "manual">("csv");
  const [csvInput, setCsvInput] = useState<string>("");
  const [parseSuccessMessage, setParseSuccessMessage] = useState<string | null>(null);
  
  // States for adding a new Column manually
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<ColumnDef["type"]>("object");
  const [newColMissing, setNewColMissing] = useState<number>(0);
  
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Trigger when presets are loaded or CSV defaults are updated
  const loadDummyCsv = () => {
    const dummy = `Departman,Maas,Deneyim_Yili
Yazilim,45000,5
Yazilim,,3
Pazarlama,32000,2
Pazarlama,34000,4
Yazilim,55000,7
IK,30000,1
IK,31500,2
Yonetim,85000,10
Yonetim,,12
Pazarlama,33000,3`;
    setCsvInput(dummy);
  };

  const handleParseCsv = () => {
    if (!csvInput.trim()) return;
    const { toplam_satir, columnsList: parsedCols } = parseCSVMetadata(csvInput);
    if (parsedCols.length > 0) {
      setToplamSatir(toplam_satir);
      setColumnsList(parsedCols);
      setParseSuccessMessage(
        `✓ CSV Başarıyla Çözümlendi: ${toplam_satir} satır ve ${parsedCols.length} kolon otomatik tanımlandı!`
      );
      setTimeout(() => setParseSuccessMessage(null), 5000);
    }
  };

  const addNewColumn = () => {
    if (!newColName.trim()) return;
    // Avoid duplicates
    if (columnsList.some(c => c.name.toLowerCase() === newColName.trim().toLowerCase())) {
      alert("Bu kolon ismi zaten mevcut!");
      return;
    }
    const newCol: ColumnDef = {
      name: newColName.trim(),
      type: newColType,
      missingCount: newColMissing,
    };
    setColumnsList([...columnsList, newCol]);
    setNewColName("");
    setNewColMissing(0);
  };

  const removeColumn = (index: number) => {
    const updated = columnsList.filter((_, idx) => idx !== index);
    setColumnsList(updated);
  };

  const updateColumnField = (index: number, key: keyof ColumnDef, val: any) => {
    const updated = [...columnsList];
    updated[index] = { ...updated[index], [key]: val };
    setColumnsList(updated);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadataJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-slate-50/50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <h3 className="font-display font-semibold text-slate-800 text-sm">1. Veri Özeti (Metadata) Tanımla</h3>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "csv"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV İçe Aktar
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Manuel Düzenle
            </span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* CSV Tab */}
        {activeTab === "csv" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                CSV Verisini Yapıştırın veya Örnek Yükleyin:
              </label>
              <button
                type="button"
                onClick={loadDummyCsv}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 underline font-semibold transition"
              >
                Hızlı Örnek CSV Yükle
              </button>
            </div>
            
            <textarea
              className="w-full h-28 bg-slate-50 border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-xs font-mono text-slate-800 placeholder-slate-400 resize-none leading-relaxed transition"
              placeholder={`Departman,Maas,Deneyim_Yili\nYazilim,45000,5\nYazilim,,3\nPazarlama,32000,2\n...`}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />

            <button
              type="button"
              onClick={handleParseCsv}
              disabled={!csvInput.trim()}
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 py-2.5 rounded-lg text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              CSV'den Metadata Çözümle
            </button>

            {parseSuccessMessage && (
              <div className="text-[11px] bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-800 font-medium">
                {parseSuccessMessage}
              </div>
            )}
          </div>
        )}

        {/* Manual/Config Tab */}
        {activeTab === "manual" && (
          <div className="space-y-4">
            {/* Total rows */}
            <div className="grid grid-cols-2 gap-4 items-center bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Toplam Satır:</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-800 font-medium"
                  value={toplamSatir}
                  onChange={(e) => setToplamSatir(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="text-[11px] text-slate-500 leading-normal">
                Notebook içerisindeki sanal veri oluşturma veya analiz adımı buradaki satır sayısını referans alacaktır.
              </div>
            </div>

            {/* Column builder list */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Kolon Kurulumları ({columnsList.length}):</span>
              
              <div className="max-h-44 overflow-y-auto pr-1 space-y-2 border border-slate-200/70 p-2 rounded-lg bg-slate-50/50">
                {columnsList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">Henüz hiç kolon yok. Aşağıdan ekleyin.</div>
                ) : (
                  columnsList.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg group transition hover:border-slate-300">
                      <div className="text-[10px] text-slate-400 font-mono w-4 font-bold">{idx + 1}</div>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500/50 py-0.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none truncate"
                        value={col.name}
                        onChange={(e) => updateColumnField(idx, "name", e.target.value)}
                        placeholder="Kolon Adı"
                      />
                      <select
                        className="bg-slate-50 border border-slate-200 text-[11px] text-slate-700 py-0.5 px-2 rounded focus:outline-none cursor-pointer hover:border-slate-300"
                        value={col.type}
                        onChange={(e) => updateColumnField(idx, "type", e.target.value)}
                      >
                        <option value="object">object (Metin)</option>
                        <option value="int64">int64 (Sayı)</option>
                        <option value="float64">float64 (Ondalık)</option>
                        <option value="bool">bool (Mantıksal)</option>
                        <option value="datetime64[ns]">datetime (Zaman)</option>
                      </select>
                      <div className="w-16 flex items-center space-x-1">
                        <span className="text-[9px] text-slate-400 font-bold">NaN:</span>
                        <input
                          type="number"
                          min="0"
                          title="Boş / Eksik Değer Sayısı"
                          className="w-10 bg-slate-50 border border-slate-250 px-1 py-0.5 rounded text-[11.5px] text-slate-700 text-center focus:outline-none"
                          value={col.missingCount}
                          onChange={(e) => updateColumnField(idx, "missingCount", Math.max(0, parseInt(e.target.value) || 0))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColumn(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 transition"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add manual inline form */}
              <div className="mt-3 grid grid-cols-12 gap-1.5 p-2.5 bg-slate-100 rounded-lg border border-slate-200/60">
                <div className="col-span-5">
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Yeni Kolon Adı"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNewColumn()}
                  />
                </div>
                <div className="col-span-4">
                  <select
                    className="w-full bg-white border border-slate-200 px-1.5 py-1.5 rounded text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as ColumnDef["type"])}
                  >
                    <option value="object">object (Metin)</option>
                    <option value="int64">int64 (Sayı)</option>
                    <option value="float64">float64 (Ondalık)</option>
                    <option value="bool">bool (Mantıksal)</option>
                    <option value="datetime64[ns]">datetime</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="NaN"
                    title="Eksik değer sayısı"
                    className="w-full bg-white border border-slate-200 px-1 py-1.5 rounded text-xs text-slate-700 text-center focus:outline-none"
                    value={newColMissing === 0 ? "" : newColMissing}
                    onChange={(e) => setNewColMissing(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={addNewColumn}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded transition w-full flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic compiled JSON viewer */}
        <div className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              API Nesne Önizleme (Veri_Ozeti_Metadata)
            </span>
            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
              {showJsonPreview ? "Gizle" : "Göster"}
            </span>
          </button>
          
          {showJsonPreview && (
            <div className="border-t border-slate-205 p-3 relative bg-slate-900">
              <button
                type="button"
                onClick={handleCopyJson}
                className="absolute top-2.5 right-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-750 text-slate-300 hover:text-white p-1 rounded transition"
                title="JSON Kopyala"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="text-[10.5px] font-mono text-emerald-400 max-h-36 overflow-y-auto leading-relaxed">
                {JSON.stringify(metadataJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
