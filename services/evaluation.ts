import axios from "axios";
import { parseCookies } from "nookies";
import { FormEvaluation, RegisterFormEvaluation, User } from "../model";

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

type RequestCreateRegisterFormEvaluatonService = {
  isReadyToEvaluated: boolean;
  summitEvaluationDate: string;
};

export async function CreateRegisterFormEvaluatonService(
  input: RequestCreateRegisterFormEvaluatonService,
): Promise<RegisterFormEvaluation> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const registerForm = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/register-form-evaluation/create`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return registerForm.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequesUpdateRegisterFormEvaluatonService = {
  isReadyToEvaluated: boolean;
  summitEvaluationDate: string;
  status: "pending" | "evaluating" | "approved" | "rejected";
};

export async function UpdateRegisterFormEvaluatonService(
  input: RequesUpdateRegisterFormEvaluatonService,
): Promise<RegisterFormEvaluation> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const registerForm = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/register-form-evaluation/update`,
      data: { ...input },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return registerForm.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

export type ResponseGetFormEvaluatonsService = (FormEvaluation & {
  user: User;
})[];
export async function GetFormEvaluatonsService(): Promise<ResponseGetFormEvaluatonsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const fromEvaluations = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/form-evaluation/get-all`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return fromEvaluations.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
