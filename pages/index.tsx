import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import {
  GetAllDocKosService,
  GetFarmerClientSideService,
  GetFarmerServerSideService,
} from "../services/farmer";
import { Farmer } from "../model";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../layouts/dashboardLayout";
import Image from "next/image";
import StatusEvaluation from "../components/status/statusEvaluation";
import DocKosLists from "../components/docKos/docKosLists";

function HomePage({ initialFarmer }: { initialFarmer: Farmer }) {
  const farmer = useQuery({
    queryKey: ["farmer"],
    queryFn: () => GetFarmerClientSideService(),
    initialData: initialFarmer,
  });
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  return (
    <DashboardLayout>
      <div className="bg-fourth-color pb-20">
        <header className="flex flex-col items-center justify-center gap-3 pt-40 font-Anuphan">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-super-main-color ring-offset-2 ">
            <Image
              src={farmer.data.picture}
              alt="profile"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className=" object-cover"
            />
          </div>
          <span className="w-80 truncate text-center text-2xl font-semibold text-super-main-color">
            สวัสดี!{" "}
            <span className="font-extrabold">
              {farmer.data.firstName} {farmer.data.lastName}
            </span>
          </span>
          <section className="mt-5 flex w-full justify-center">
            <StatusEvaluation />
          </section>
        </header>
        <main>
          <DocKosLists docKos={docKos} />
        </main>
      </div>
    </DashboardLayout>
  );
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(ctx);
    const accessToken = cookies.access_token;
    if (accessToken) {
      const initialFarmer = await GetFarmerServerSideService({
        access_token: accessToken,
      });
      return {
        props: {
          initialFarmer,
        },
      };
    } else {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/sign-in",
        },
      };
    }
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
