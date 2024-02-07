import { ResponseGetAllDocKos } from "./../../server-koratkos/src/farmer/models/response-farmer.model";
import axios from "axios";
import { parseCookies } from "nookies";
import { DocKos1, FarmDocKos1, PlantKos1 } from "../model";
type RequestCreateDocKos1Service = {
  address: string;
  villageNumber: string;
  subdistrict: string;
  district: string;
  province: string;
  phoneNumber: string;
};
export async function CreateDocKos1Service(
  input: RequestCreateDocKos1Service,
): Promise<DocKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos1 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/create`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos1.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
export type ResponseGetAllDocKos1Service = DocKos1 & {
  farmKos1: FarmDocKos1;
  plantKOS1s: PlantKos1[];
};
export async function GetDocKos1Service(): Promise<ResponseGetAllDocKos1Service> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos1 = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/get`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos1.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateFarmDocKos1Service = {
  address: string;
  villageNumber: string;
  subdistrict: string;
  district: string;
  province: string;
  latitude: string;
  longitude: string;
  productionProcess: string[];
  docKos01Id: string;
  certRequestDate: string;
  productionMethod: string;
  mapTerrain: string;
  mapHybrid: string;
  plotsTotal: number;
  raiTotal: number;
  nganTotal: number;
  certicatedPlotTotal: number;
  certicatedRaiTotal: number;
  certicatedNganTotal: number;
};

export async function CreateFarmDocKos1Service(
  input: RequestCreateFarmDocKos1Service,
): Promise<FarmDocKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const farmDockos1 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/create-farmKOS1`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return farmDockos1.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreatePlantKos1Service = {
  plant: string;
  raiTotal: number;
  annualProdCycles: string;
  seasonProd: string[];
  expHarvestDate: Date;
  expYieldAmt: number;
  farmKOS1Id: string;
};
export async function CreatePlantKos1Service(
  input: RequestCreatePlantKos1Service,
): Promise<PlantKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const plant = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/create-plantKos1`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return plant.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
type RequesUpdatePlantKos1Service = {
  query: {
    plantKOS1Id: string;
  };
  body: {
    plant?: string;
    raiTotal?: number;
    annualProdCycles?: string;
    seasonProd?: string[];
    expHarvestDate?: Date;
    expYieldAmt?: number;
  };
};
export async function UpdatePlantKos1Service(
  input: RequesUpdatePlantKos1Service,
): Promise<PlantKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const plant = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/update-plantKos1`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return plant.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
type RequestDeletePlantKos1Service = {
  plantKOS1Id: string;
};
export async function DeletePlantKos1Service(
  input: RequestDeletePlantKos1Service,
): Promise<PlantKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const plant = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/delete-plantKos1`,
      params: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return plant.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateDocKos1Service = {
  address?: string;
  villageNumber?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
};

export async function UpdateDocKos1Service(
  input: RequestUpdateDocKos1Service,
): Promise<DocKos1> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos1 = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos1/update`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos1.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
