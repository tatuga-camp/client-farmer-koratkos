import axios from "axios";
import { DocKos1, DocKos2, DocKos3, DocKos4, DocKos5, Farmer } from "../model";
import { parseCookies } from "nookies";

export async function GetFarmerServerSideService({
  access_token,
}: {
  access_token: string;
}): Promise<Farmer> {
  try {
    const farmer = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/get-me`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

export async function GetFarmerClientSideService(): Promise<Farmer> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const farmer = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/get-me`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

export type ResponseGetAllDocKosService = {
  kos1: DocKos1;
  kos2: DocKos2;
  kos3: DocKos3;
  kos4: DocKos4;
  kos5: DocKos5;
};
export async function GetAllDocKosService(): Promise<ResponseGetAllDocKosService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const dockos = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/get-all-kos`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return dockos.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateFarmerService = {
  title?: string;
  firstName?: string;
  lastName?: string;
  identityCardId?: string;
  phoneNumber?: string;
};
export async function UpdateFarmerService(
  input: RequestUpdateFarmerService,
): Promise<Farmer> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const farmer = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/update`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      data: {
        ...input,
        identityCardId: input?.identityCardId?.replace(/-/g, ""),
        phoneNumber: input?.phoneNumber?.replace(/-/g, ""),
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

export async function UploadProfileService({
  file,
}: {
  file: File;
}): Promise<Farmer> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const farmer = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/update-profile`,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
      data: {
        file: file,
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
