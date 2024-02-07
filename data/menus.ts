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
