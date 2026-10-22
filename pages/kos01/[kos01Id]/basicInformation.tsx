import React from "react";
import BasicInformation from "../../../components/docKos/kos1/forms/basicInformation";
import Kos01EditPage from "../../../components/docKos/kos1/kos01EditPage";
import DashboardLayout from "../../../layouts/dashboardLayout";

function EditBasicInformation() {
  return (
    <DashboardLayout>
      <Kos01EditPage step={0}>{(docKos1) => <BasicInformation isUpdate docKos1={docKos1} />}</Kos01EditPage>
    </DashboardLayout>
  );
}

export default EditBasicInformation;
