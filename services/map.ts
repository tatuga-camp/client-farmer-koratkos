import axios from "axios";
import { parseCookies } from "nookies";
type RequestGetStaticMapService = {
  maptype: "hybrid" | "terrain";
  lat: string;
  lng: string;
};
export async function GetStaticMapService(
  input: RequestGetStaticMapService,
): Promise<{ imageURL: string }> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const map = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/google-map/get-static`,
      params: {
        ...input,
        zoom: 19,
        size: "900x900",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return map.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
