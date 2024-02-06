import axios from "axios";
import { parseCookies } from "nookies";

export type ResponseCheckEvaluationService =
  | "ready"
  | "not-ready"
  | "pending"
  | "rejected"
  | "approved";

export async function GetCheckStatusEvaluationService(): Promise<ResponseCheckEvaluationService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const status = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/register-form-evaluation/check`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return status.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
