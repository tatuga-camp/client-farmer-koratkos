import { parseCookies } from "nookies";
import axios from "axios";
import { DocKos4, FactoryKos4, Pagination } from "../model";

export async function CreateDocKos04Service(): Promise<DocKos4> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos4 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos4/create-docKos4`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos4.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetFactorKos04ByPageService = {
  dockKos4Id: string;
  page: number;
  limit: number;
};
export async function GetFactorKos04ByPageService(
  input: RequestGetFactorKos04ByPageService,
): Promise<Pagination<FactoryKos4>> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos4 = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos4/get-prodFactorys`,
      params: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos4.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateFactoryKos4Service = {
  purchaseDate: string;
  prodFactorTypes: string;
  amount: number;
  source: string;
  docKos04Id: string;
};
export async function CreateFatorKos4Service(
  input: RequestCreateFactoryKos4Service,
): Promise<FactoryKos4> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const kos4 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos4/create-prodFactory`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos4.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateFactoryKos4Service = {
  query: {
    prodFactorKos4Id: string;
  };
  body: {
    purchaseDate?: string;
    prodFactorTypes?: string;
    amount?: number;
    source?: string;
  };
};
export async function UpdateFatorKos4Service(
  input: RequestUpdateFactoryKos4Service,
): Promise<FactoryKos4> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const factor = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos4/update-prodFactory`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return factor.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteFactoryKos4Service = {
  prodFactorKos4Id: string;
};
export async function DeleteFatorKos4Service(
  input: RequestDeleteFactoryKos4Service,
): Promise<FactoryKos4> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const factor = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos4/delete-prodFactory`,
      params: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return factor.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
