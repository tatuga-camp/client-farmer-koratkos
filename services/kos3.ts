import { parseCookies } from "nookies";
import axios from "axios";
import { ActivityKos3, DocKos3, FileActivityKos3, Pagination } from "../model";

export async function CreateDocKos3Service(): Promise<DocKos3> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const kos3 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos3/create-docKos3`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos3.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetActivityKos3ByPageService = {
  limit: number;
  page: number;
  docKos3Id: string;
};

export type ResponseGetActivityKos3ByPageService = Pagination<
  ActivityKos3 & { fileOnActivities: FileActivityKos3[] }
>;

export async function GetActivityKos3ByPageService(
  input: RequestGetActivityKos3ByPageService,
): Promise<ResponseGetActivityKos3ByPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const kos3 = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos3/get-activities`,
      params: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos3.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateActivityKos3Service = {
  plotNumber: number;
  activityDate: string;
  note: string;
  docKos03Id: string;
};
export async function CreateActivityKos3Service(
  input: RequestCreateActivityKos3Service,
): Promise<ActivityKos3> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const kos3 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos3/create-activities`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos3.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateActivityKos3Service = {
  query: {
    docKos03Id: string;
    activitiesKos3Id: string;
  };
  body: {
    plotNumber?: number;
    activityDate?: string;
    note?: string;
  };
};
export async function UpdateActivityKos3Service(
  input: RequestUpdateActivityKos3Service,
): Promise<ActivityKos3> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const kos3 = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos3/update-activities`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos3.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateFileOnActivityKos3Service = {
  url: string;
  type: string;
  activitiesKos3Id: string;
};

export async function CreateFileOnActivityKos3Service(
  input: RequestCreateFileOnActivityKos3Service,
): Promise<ActivityKos3> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const kos3 = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/kos3/create-file`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return kos3.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
