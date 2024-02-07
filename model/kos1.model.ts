import { Farmer } from "./farmer.model";
export interface DocKos1 {
  id: string;
  createAt: Date;
  updateAt: Date;
  firstName: string;
  lastname: string;
  title: string;
  address: string;
  villageNumber?: string;
  subdistrict: string;
  district: string;
  province: string;
  phoneNumber: string;
  farmerId: string;
}

export type FarmDocKos1 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  address: string;
  villageNumber?: string;
  subdistrict: string;
  district: string;
  province: string;
  latitude: string;
  longitude: string;
  mapTerrain?: string;
  mapHybrid?: string;
  certRequestDate: Date;
  productionProcess: string[];
  productionMethod: string;
  plotsTotal?: number;
  raiTotal?: number;
  nganTotal?: number;
  certicatedPlotTotal?: number;
  certicatedRaiTotal?: number;
  certicatedNganTotal?: number;
  moreInfo?: string;
  docKos01Id: string;
  farmerId: string;
};

export type PlantKos1 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  plant: string;
  raiTotal: string;
  annualProdCycles: number;
  seasonProd: string[];
  expHarvestDate: Date;
  expYieldAmt: number;
  farmKOS1Id: string;
  farmerId: string;
};
