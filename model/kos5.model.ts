export type DocKos5 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  farmerId: string;
};

export type HarvestLogDocKos5 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  plotNumber: number;
  harvestDate: string;
  plantType: string;
  amount: number;
  marketing: string;
  farmerId: string;
  docKos05Id: string;
};
