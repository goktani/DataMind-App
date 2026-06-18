import React, { useState } from "react";
import { Copy, Check, Download, AlertCircle, Play, FileText, ChevronRight, Terminal } from "lucide-react";
import { markdownToIpynb } from "../utils";

interface NotebookViewerProps {
  markdown: string;
}

interface Cell {
  id: string;
  type: "markdown" | "code";
  content: string;
  executionCount?: number;
  outputs?: string[];
  isRunning?: boolean;
}

export function NotebookViewer({ markdown }: NotebookViewerProps) {
  const [activeTab, setActiveTab] = useState<"notebook" | "raw">("notebook");
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  // Parse markdown into Notebook Cells
  const parseMarkdownToCells = (md: string): Cell[] => {
    const lines = md.split(/\r?\n/);
    const parsedCells: Cell[] = [];
    let currentContent: string[] = [];
    let isInsideCode = false;
    let cellCounter = 1;

    const flushCode = () => {
      if (currentContent.length > 0) {
        parsedCells.push({
          id: `cell-code-${cellCounter}`,
          type: "code",
          content: currentContent.join("\n").trim(),
          executionCount: cellCounter,
          outputs: generateMockOutput(currentContent.join("\n").trim()),
        });
        cellCounter++;
        currentContent = [];
      }
    };

    const flushMarkdown = () => {
      if (currentContent.length > 0) {
        const text = currentContent.join("\n").trim();
        if (text) {
          parsedCells.push({
            id: `cell-md-${parsedCells.length + 1}`,
            type: "markdown",
            content: text,
          });
        }
        currentContent = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("```python") || line.trim().startsWith("```py")) {
        flushMarkdown();
        isInsideCode = true;
      } else if (line.trim().startsWith("```") && isInsideCode) {
        flushCode();
        isInsideCode = false;
      } else {
        currentBlockPush(line);
      }
    }

    function currentBlockPush(l: string) {
      currentContent.push(l);
    }

    if (isInsideCode) {
      flushCode();
    } else {
      flushMarkdown();
    }

    return parsedCells;
  };

  // Generate a realistic Python execution printed log based on code structure
  const generateMockOutput = (code: string): string[] => {
    const logs: string[] = [];
    if (code.includes("import pandas")) {
      logs.push("import pandas as pd  # OK");
    }
    if (code.includes("print(")) {
      // Find strings inside print statement
      const matches = code.match(/print\(([^)]+)\)/g);
      if (matches) {
        matches.forEach(m => {
          const clean = m.replace("print(", "").replace(")", "").replace(/['"]/g, "").trim();
          logs.push(clean);
        });
      }
    }
    if (code.includes(".head()")) {
      logs.push("   Departman      Maas  Deneyim_Yili\n0   Yazilim   45000.0             5\n1   Yazilim   43000.0             3\n2 Pazarlama   32000.0             2\n3 Pazarlama   34000.0             4\n4   Yazilim   55000.0             7");
    }
    if (code.includes(".isnull()")) {
      logs.push("Boş Değer Dağılımı:\nDepartman: 0\nMaas: 0\nDeneyim_Yili: 0\ndtype: int64");
    }
    if (code.includes("px.scatter") || code.includes("px.parallel_categories") || code.includes("px.bar") || code.includes("px.violin")) {
      logs.push("Plotly-Dark canvas successfully compiled.");
      logs.push("<Plotly.graph_objs._figure.Figure object at 0x7fa816e9bca0>");
    }
    if (logs.length === 0) {
      logs.push("Cell executed successfully. No stdout returned.");
    }
    return logs;
  };

  const cells = parseMarkdownToCells(markdown);
  const [liveCells, setLiveCells] = useState<Cell[]>(cells);

  // Initialize cells if list changes
  React.useEffect(() => {
    setLiveCells(parseMarkdownToCells(markdown));
  }, [markdown]);

  const handleRunCell = (cellId: string) => {
    setLiveCells(prev => prev.map(cell => {
      if (cell.id === cellId) {
        return {
          ...cell,
          isRunning: true,
        };
      }
      return cell;
    }));

    setTimeout(() => {
      setLiveCells(prev => prev.map(cell => {
        if (cell.id === cellId) {
          return {
            ...cell,
            isRunning: false,
            // Increment dummy run count
            executionCount: (cell.executionCount || 0) + 1,
          };
        }
        return cell;
      }));
    }, 1200);
  };

  const handleCopyCell = (cellId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCellId(cellId);
    setTimeout(() => setCopiedCellId(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadIpynb = () => {
    const ipynbContent = markdownToIpynb(markdown);
    const blob = new Blob([ipynbContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oto_eda_raporu.ipynb";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Safe inner HTML renderer for markdown cells (stripping raw markdown syntax into visually crisp text)
  const renderMarkdownContent = (content: string) => {
    let html = content;

    // Convert triple asterisks or backticks inside markdown text
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-indigo-50 px-1.5 py-0.5 border border-indigo-150 text-indigo-700 font-semibold rounded">$1</code>');
    
    // Add space spacing and lists
    const paragraphs = html.split("\n").map(line => {
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        // Bullet list
        const text = line.trim().substring(1).trim();
        return `<li class="ml-4 list-disc text-slate-700 text-xs mb-1.5 leading-relaxed">${text}</li>`;
      }
      if (line.trim().startsWith("<h2 ") || line.trim().startsWith("<h3 ") || line.trim().startsWith("<h1 ")) {
        return line; // Render as literal HTML heading
      }
      if (line.trim().length === 0) return "";
      return `<p class="text-xs text-slate-700 mb-2.5 leading-relaxed">${line}</p>`;
    }).join("");

    return <div dangerouslySetInnerHTML={{ __html: paragraphs }} className="py-1 prose max-w-none text-slate-800" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Tab Navigation header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
            <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
            <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="font-mono text-xs text-slate-600 font-semibold px-2 px-2.5 py-1 bg-white rounded border border-slate-200 flex items-center gap-1.5">
            ✏️ auto_eda_report.ipynb
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notebook / Raw tab selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("notebook")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "notebook"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Jupyter Notebook
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "raw"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ham Markdown
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200"></div>

          {/* Action buttons */}
          <button
            onClick={handleDownloadIpynb}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Notebook (.ipynb) İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.ipynb İndir</span>
          </button>
        </div>
      </div>

      {/* Main output view */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-5">
        {activeTab === "notebook" ? (
          <div className="space-y-4">
            {/* Warning block about running code */}
            <div className="bg-indigo-50/40 border border-indigo-150 rounded-lg p-4 flex items-start gap-2.5 max-w-4xl mx-auto">
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  Profesyonel Keşifsel Veri Raporu ve Jupyter Notebook Hazırlandı!
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                  Her kod hücresini tek tek kopyalayabilir, tüm notebook'u tek tıkla indirip yerel bilgisayarınızda çalıştırabilirsiniz. Hücreleri sanal olarak çalıştırmak için <strong className="text-indigo-700">Çematiğinde bulunan Çalıştır</strong> düğmesine basın.
                </p>
              </div>
            </div>

            {/* Render Notebook Cells */}
            <div className="max-w-4xl mx-auto space-y-3">
              {liveCells.map((cell, idx) => {
                const isMarkdown = cell.type === "markdown";
                return (
                  <div
                    key={cell.id}
                    className={`flex items-start group relative rounded-lg border transition-all ${
                      isMarkdown
                        ? "border-transparent hover:bg-slate-100/50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {/* Left padding indicators like real jupyter */}
                    <div className="w-14 pl-1 pt-4 border-r border-slate-100 font-mono text-[10px] select-none text-right pr-2 shrink-0">
                      {isMarkdown ? (
                        <span className="text-slate-400"></span>
                      ) : cell.isRunning ? (
                        <span className="text-indigo-600 font-bold animate-pulse font-mono">In [*]:</span>
                      ) : (
                        <span className="text-slate-400 font-medium font-mono">In [{cell.executionCount || " "}]:</span>
                      )}
                    </div>

                    {/* Cell Content area */}
                    <div className="flex-1 p-3.5 overflow-x-auto min-w-0">
                      {isMarkdown ? (
                        <div className="notebook-markdown prose max-w-none">
                          {renderMarkdownContent(cell.content)}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Code Block */}
                          <div className="relative">
                            <pre className="font-mono text-xs text-blue-100 leading-relaxed bg-slate-900 p-4 border border-slate-950 rounded-lg overflow-x-auto select-all">
                              <code>{cell.content}</code>
                            </pre>
                            
                            {/* Action overlay */}
                            <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-slate-950/80 border border-slate-800 p-1 rounded-md backdrop-blur-xs">
                              <button
                                onClick={() => handleRunCell(cell.id)}
                                disabled={cell.isRunning}
                                className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-slate-800 transition"
                                title="Kodu Çalıştır (Sanal)"
                              >
                                <Play className={`w-3.5 h-3.5 fill-emerald-400/20 ${cell.isRunning ? "text-emerald-400 animate-spin" : ""}`} />
                              </button>
                              <div className="w-px h-3.5 bg-slate-800"></div>
                              <button
                                onClick={() => handleCopyCell(cell.id, cell.content)}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                                title="Hücre Kodunu Kopyala"
                              >
                                {copiedCellId === cell.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Print output */}
                          {cell.outputs && cell.outputs.length > 0 && (
                            <div className="border border-slate-200 rounded-lg bg-zinc-900 overflow-hidden">
                              <div className="bg-zinc-950 border-b border-slate-900 px-3 py-1 flex items-center space-x-1.5 select-none">
                                <Terminal className="w-2.5 h-2.5 text-slate-500" />
                                <span className="font-mono text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                                  Standard Output
                                </span>
                              </div>
                              <pre className="font-mono text-[11px] text-zinc-300 leading-normal p-3.5 bg-zinc-950 select-text overflow-x-auto whitespace-pre font-medium">
                                {cell.outputs.join("\n")}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Raw Markdown controls */}
            <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-indigo-600" />
                Raw Markdown formatı, makale veya döküman paylaşımları için hazırdır.
              </span>
              <button
                onClick={handleCopyAll}
                className="bg-slate-100 border border-slate-200 hover:border-slate-350 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Raporu Kopyala</span>
              </button>
            </div>

            {/* Markdown Text Area */}
            <textarea
              readOnly
              className="w-full h-[65vh] bg-slate-900 border border-slate-950 text-blue-100 p-4 rounded-lg font-mono text-xs focus:outline-none resize-none leading-relaxed shadow-inner"
              value={markdown}
            />
          </div>
        )}
      </div>
    </div>
  );
}
