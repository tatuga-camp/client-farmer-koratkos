import type { ReactNode } from "react";
import { HomePageNavbar } from "../components/navbars/homePageNavbar";
import { Backgroud } from "../components/svgs/Backgroud";

type LayoutProps = {
  children: ReactNode;
};

function HomePageLayout({ children }: LayoutProps) {
  return (
    <section>
      <HomePageNavbar />
      {children}
    </section>
  );
}

export default HomePageLayout;
