import { parseCookies } from "nookies";
import axios from "axios";
import { DocKos5, HarvestLogDocKos5, Pagination } from "../model";

export async function CreateDocKos05Service(): Promise<DocKos5> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const harvestLogs = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos5/create-docKos5`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return harvestLogs.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetHarvestLogKos5ByPageService = {
  page: number;
  limit: number;
  dockKos5Id: string;
};
export async function GetHarvestLogKos5ByPageService(
  input: RequestGetHarvestLogKos5ByPageService,
): Promise<Pagination<HarvestLogDocKos5>> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const harvestLogs = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos5/get-harvestLogs`,
      params: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return harvestLogs.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateHarvestLogKos5Service = {
  plotNumber: number;
  harvestDate: string;
  plantType: string;
  amount: number;
  marketing: string;
  typeAmount: string;
  docKos05Id: string;
};
export async function CreateHarvestLogKos5Service(
  input: RequestCreateHarvestLogKos5Service,
): Promise<HarvestLogDocKos5> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const harvestLog = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos5/create-harvestLog`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return harvestLog.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateHarvestLogKos5Service = {
  query: {
    harvestLogKos5Id: string;
  };
  body: {
    plotNumber?: number;
    harvestDate?: string;
    plantType?: string;
    amount?: number;
    typeAmount: string;
    marketing?: string;
  };
};
export async function UpdateHarvestLogKos5Service(
  input: RequestUpdateHarvestLogKos5Service,
): Promise<HarvestLogDocKos5> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const harvestLog = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos5/update-harvestLog`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return harvestLog.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteHarvestLogKos5Service = {
  harvestLogKos5Id: string;
};
export async function DeleteHarvestLogKos5Service(
  input: RequestDeleteHarvestLogKos5Service,
): Promise<HarvestLogDocKos5> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const harvestLog = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos5/delete-harvestLog`,
      params: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return harvestLog.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
