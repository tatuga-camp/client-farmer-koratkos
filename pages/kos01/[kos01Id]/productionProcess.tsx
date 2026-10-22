import React from "react";
import ProductionInformation from "../../../components/docKos/kos1/forms/productionInformation";
import Kos01EditPage from "../../../components/docKos/kos1/kos01EditPage";
import DashboardLayout from "../../../layouts/dashboardLayout";

function EditProductionProcess() {
  return (
    <DashboardLayout>
      <Kos01EditPage step={2} tips={["1 ไร่ = 4 งาน", "พื้นที่ที่ขอรับรองต้องไม่มากกว่าพื้นที่ทั้งหมด"]}>
        {(docKos1) => <ProductionInformation isUpdate docKos1={docKos1} />}
      </Kos01EditPage>
    </DashboardLayout>
  );
}

export default EditProductionProcess;
