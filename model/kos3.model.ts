export type DocKos3 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  farmerId: string;
};

export type ActivityKos3 = {
  id: string;
  updateAt: Date;
  plotNumber: number;
  activityDate: string;
  note: string;
  docKos03Id: string;
  farmerId: string;
};

export type FileActivityKos3 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  url: string;
  type: string;
  activitiesKos3Id: string;
};
