import type { ReactNode } from "react";
import { HomePageNavbar } from "../components/navbars/homePageNavbar";

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
