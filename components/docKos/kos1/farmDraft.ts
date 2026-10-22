// While creating KOS-01, steps 2 and 3 are saved to the server together, so step 2
// (and step 3 when the farmer goes back) wait in localStorage until then.
import { AddressValue } from "../../ui";

export type FarmDraft = AddressValue & {
  latitude: string;
  longitude: string;
  mapHybrid?: string;
  mapTerrain?: string;
  certRequestDate?: string;
};

export type ProductionDraft = {
  productionProcess: string;
  productionMethod: string;
  productionMethodOther: string;
  plotsTotal: string;
  raiTotal: string;
  nganTotal: string;
  certicatedPlotTotal: string;
  certicatedRaiTotal: string;
  certicatedNganTotal: string;
};

const FARM_KEY = "farmFieldInformation";
const PRODUCTION_KEY = "productionInformation";

const read = (key: string) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

// Older drafts stored {province: {name_th}} objects and "moo" as before.
const name = (value: unknown) =>
  typeof value === "object" && value !== null ? ((value as { name_th?: string }).name_th ?? "") : ((value as string) ?? "");

export function readFarmDraft(): FarmDraft | undefined {
  const draft = read(FARM_KEY);
  if (!draft) return undefined;
  return {
    address: draft.address ?? "",
    moo: draft.moo ?? "",
    province: name(draft.province),
    amphure: name(draft.amphure),
    tambon: name(draft.tambon),
    latitude: draft.latitude ?? "",
    longitude: draft.longitude ?? "",
    mapHybrid: draft.mapHybrid,
    mapTerrain: draft.mapTerrain,
    certRequestDate: draft.certRequestDate ? new Date(draft.certRequestDate).toISOString() : undefined,
  };
}

export const saveFarmDraft = (draft: FarmDraft) => window.localStorage.setItem(FARM_KEY, JSON.stringify(draft));

export const readProductionDraft = (): ProductionDraft | undefined => read(PRODUCTION_KEY);

export const saveProductionDraft = (draft: ProductionDraft) =>
  window.localStorage.setItem(PRODUCTION_KEY, JSON.stringify(draft));

export function clearKos01Drafts() {
  window.localStorage.removeItem(FARM_KEY);
  window.localStorage.removeItem(PRODUCTION_KEY);
  window.localStorage.removeItem("basicInformation");
}
