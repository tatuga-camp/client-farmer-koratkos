export type DocKos4 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  farmerId: string;
};

export type FactoryKos4 = {
  id: string;
  createAt: Date;
  updateAt: Date;
  purchaseDate: string;
  prodFactorTypes: string;
  amount: number;
  source: string;
  docKos04Id: string;
  typeAmount: string;
};
