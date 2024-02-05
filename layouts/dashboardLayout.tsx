import type { ReactNode } from "react";
import DashboardNavbar from "../components/navbars/dashboardNavbar";

type LayoutProps = {
  children: ReactNode;
};

function DashboardLayout({ children }: LayoutProps) {
  return (
    <section>
      <DashboardNavbar />
      {children}
    </section>
  );
}

export default DashboardLayout;
