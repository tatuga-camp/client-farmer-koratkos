export type DocKos2 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  numberOfPlotForKosCertificated: string;
  map: string;
  marketingDetail?: string;
  farmerId: string;
};

export type OrgCropProdCalForKos2 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  plotNumber: number;
  landArea: number;
  plantType: string;
  rangeDate: string[];
  yearPlan: string;
  yieldPerRai: number;
  seed: string;
  source: string;
  docKos02Id: string;
  farmerId: string;
};
