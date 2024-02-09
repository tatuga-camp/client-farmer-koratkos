import { parseCookies } from "nookies";
import { DocKos2, OrgCropProdCalForKos2 } from "../model";
import axios from "axios";

type RequestCreateDocKos2Service = {
  file: File;
  numberOfPlotForKosCertificated: string;
  marketingDetail: string;
};
export async function CreateDocKos2Service(
  input: RequestCreateDocKos2Service,
): Promise<DocKos2> {
  try {
    const formData = new FormData();
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    // Append input data to formData
    formData.append("file", input.file);
    if (input.marketingDetail)
      formData.append("marketingDetail", input.marketingDetail);
    formData.append(
      "numberOfPlotForKosCertificated",
      input.numberOfPlotForKosCertificated,
    );

    const farm = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/create-docKos2`,
      data: formData, // Set formData as the data property
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return farm.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateDocKos2Service = {
  file: File;
  numberOfPlotForKosCertificated: string;
  marketingDetail: string;
};
export async function UpdateDocKos2Service(
  input: RequestUpdateDocKos2Service,
): Promise<DocKos2> {
  try {
    const formData = new FormData();
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    // Append input data to formData
    if (input.file) formData.append("file", input.file);
    if (input.marketingDetail)
      formData.append("marketingDetail", input.marketingDetail);
    formData.append(
      "numberOfPlotForKosCertificated",
      input.numberOfPlotForKosCertificated,
    );

    const farm = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/update-docKos2`,
      data: formData, // Set formData as the data property
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return farm.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
export type ResponseGetDocKos02Service = DocKos2 & {
  orgCropProdCalForKos2s: OrgCropProdCalForKos2[];
};

export async function GetDocKos02Service(): Promise<ResponseGetDocKos02Service> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const dockos02 = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/get-docKos2`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return dockos02.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateOrgProdKos2Service = {
  landArea: number;
  plantType: string;
  rangeDate: string[];
  yieldPerRai: number;
  docKos02Id: string;
  seed: string;
  source: string;
  yearPlan: string;
  plotNumber: number;
};
export async function CreateOrgProdKos2Service(
  input: RequestCreateOrgProdKos2Service,
): Promise<OrgCropProdCalForKos2> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const dockos02 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/create-orgCropProdCalForKos2`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return dockos02.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateOrgProdKos2Service = {
  query: {
    orgCropProdCalForKos2Id: string;
    docKos02Id: string;
  };
  body: {
    landArea?: number;
    plantType?: string;
    rangeDate?: string[];
    yieldPerRai?: number;
    seed?: string;
    source?: string;
    plotNumber?: number;
    yearPlan?: string;
  };
};
export async function UpdateOrgProdKos2Service(
  input: RequestUpdateOrgProdKos2Service,
): Promise<OrgCropProdCalForKos2> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const orgCrop = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/update-orgCropProdCalForKos2`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return orgCrop.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteOrgCropProdCalForKos2Service = {
  orgCropProdCalForKos2Id: string;
};
export async function DeleteOrgCropProdCalForKos2Service(
  input: RequestDeleteOrgCropProdCalForKos2Service,
): Promise<OrgCropProdCalForKos2> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const orgCrop = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos2/delete-orgCropProdCalForKos2`,
      params: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return orgCrop.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
