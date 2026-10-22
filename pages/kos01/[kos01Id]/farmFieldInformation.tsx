import React from "react";
import FarmFieldInformation from "../../../components/docKos/kos1/forms/farmFieldInformation";
import Kos01EditPage from "../../../components/docKos/kos1/kos01EditPage";
import DashboardLayout from "../../../layouts/dashboardLayout";

function EditFarmFieldInformation() {
  return (
    <DashboardLayout>
      <Kos01EditPage
        step={1}
        tips={["ถ้าย้ายพิกัด ต้องกด “ดูแผนที่แปลง” ใหม่ทุกครั้ง แล้วตรวจว่าหมุดอยู่ตรงแปลง"]}
      >
        {(docKos1) => <FarmFieldInformation isUpdate docKos1={docKos1} />}
      </Kos01EditPage>
    </DashboardLayout>
  );
}

export default EditFarmFieldInformation;
