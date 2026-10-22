import { parseCookies } from "nookies";
import axios from "axios";

type RequestGetSignURLService = {
  fileName: string;
  fileType: string;
};
export async function GetSignURLService(
  input: RequestGetSignURLService,
): Promise<{
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
}> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const signURL = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/google-storage/farmer/get-signURL`,
      params: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return signURL.data;
  } catch (error: any) {
    console.error(error?.response?.data ?? error);
    throw error?.response?.data;
  }
}

type RequestUploadSignURLService = {
  contentType: string;
  file: File;
  signURL: string;
};
export async function UploadSignURLService(
  input: RequestUploadSignURLService,
): Promise<{
  message: "success" | "error";
}> {
  try {
    const response = await fetch(input.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${input.contentType}`,
      },
      body: input.file,
    });
    // fetch only rejects on network failure; an expired or refused signed URL comes back as 4xx.
    if (!response.ok) {
      console.error(`Upload failed with status ${response.status}`);
      return { message: "error" };
    }
    return { message: "success" };
  } catch (error: any) {
    console.error(error?.response?.data ?? error);
    return { message: "error" };
  }
}
