export interface ColumnDef {
  name: string;
  type: "object" | "int64" | "float64" | "bool" | "datetime64[ns]";
  missingCount: number;
}

export interface VeriOzetiMetadata {
  toplam_satir: number;
  kolonlar: string[];
  veri_tipleri: Record<string, string>;
  eksik_degerler: Record<string, number>;
}

export interface PredefinedTemplate {
  title: string;
  description: string;
  metadata: VeriOzetiMetadata;
  customDemand: string;
}
