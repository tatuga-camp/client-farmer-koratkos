import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetAllDocKosService } from "../services/farmer";
import { FaEdit } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";

export const menuKos01 = ({ kos1Id }: { kos1Id: string }) => {
  return [
    { title: "ข้อมูลพื้นฐาน", href: `/kos01/${kos1Id}/basicInformation` },
    {
      title: "ที่ตั้งสถานที่ผลิตพืชอินทรีย์",
      href: `/kos01/${kos1Id}/farmFieldInformation`,
    },
    { title: "กระบวนการผลิต", href: `/kos01/${kos1Id}/productionProcess` },
    { title: "ชนิดพืชที่ขอการรับรอง", href: `/kos01/${kos1Id}/plantKos1` },
  ];
};

export const menuKos = ({
  docKos,
}: {
  docKos: UseQueryResult<ResponseGetAllDocKosService, Error>;
}) => {
  return [
    {
      title: "หน้าหลัก",
      href: "/",
      icon: GoHomeFill,
    },
    {
      title: "KOS-01",
      href: docKos.data?.kos1?.id
        ? `/kos01/${docKos.data?.kos1?.id}`
        : "/create/kos01",
      icon: FaEdit,
    },
    {
      title: "KOS-02",
      href: docKos.data?.kos2?.id
        ? `/kos02/${docKos.data?.kos2?.id}`
        : "/create/kos02",
      icon: FaEdit,
    },
    {
      title: "KOS-03",
      href: docKos.data?.kos3?.id
        ? `/kos03/${docKos.data?.kos3?.id}`
        : "/create/kos03",
      icon: FaEdit,
    },
    {
      title: "KOS-04",
      href: docKos.data?.kos4?.id
        ? `/kos04/${docKos.data?.kos4?.id}`
        : "/create/kos04",
      icon: FaEdit,
    },
    {
      title: "KOS-05",
      href: docKos.data?.kos5?.id
        ? `/kos05/${docKos.data?.kos5?.id}`
        : "/create/kos05",
      icon: FaEdit,
    },
    {
      title: "การตั้งค่า",
      href: "/farmer/setting",
      icon: IoSettingsOutline,
    },
  ];
};
export const sponsors = [
  {
    title: "หน่วยบริหารและจัดการทุน ด้านการพัฒนาระดับพื้นที่",
    url: "/logo/หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่.png",
  },
  {
    title: "มหาวิทยาลัยราชภัฏนครราชสีมา",
    url: "/logo/มหาวิทยาลัยราชภัฏนครราชสีมา.png",
  },
  {
    title: "KORAT Organic Standard",
    url: "/logo/KORATOrganicStandard.png",
  },
  {
    title: "จังหวัดนครราชสีมา",
    url: "/logo/จังหวัดนครราชสีมา.png",
  },
  {
    title: "กรมส่งเสริมการเกษตร",
    url: "/logo/กรมส่งเสริมการเกษตร.png",
  },
  {
    title: "กรมส่งเสริมการปกครองท้องถิ่น",
    url: "/logo/กรมส่งเสริมการปกครองท้องถิ่น.png",
  },
];
