import React from "react";
import CardPlantKos1 from "../../../components/docKos/kos1/forms/cardPlantKos1";
import Kos01EditPage from "../../../components/docKos/kos1/kos01EditPage";
import DashboardLayout from "../../../layouts/dashboardLayout";

function PlantKos1Page() {
  return (
    <DashboardLayout>
      <Kos01EditPage step={3}>{(docKos1) => <CardPlantKos1 docKos1={docKos1} />}</Kos01EditPage>
    </DashboardLayout>
  );
}

export default PlantKos1Page;
