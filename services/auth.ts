import axios, { AxiosError } from "axios";
import { Farmer } from "../model";

type RequestSignInService = {
  identityCardId: string;
  phoneNumber: string;
};
type ResponseSignInService = {
  access_token: string;
  farmer: Farmer;
};
export async function SignInService(
  input: RequestSignInService,
): Promise<ResponseSignInService> {
  try {
    const farmer = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/auth/sign-in`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestSignUpService = {
  title: string;
  firstName: string;
  lastName: string;
  identityCardId: string;
  phoneNumber: string;
};

type ResponseSignUpService = {
  access_token: string;
  farmer: Farmer;
};
export async function SignUpService(
  input: RequestSignUpService,
): Promise<ResponseSignUpService> {
  try {
    const farmer = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/farmer/auth/sign-up`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return farmer.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
