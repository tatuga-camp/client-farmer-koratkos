import axios from "axios";
import { Farmer } from "../model";
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
