export type RegisterFormEvaluation = {
  id: string;
  createAt: Date;
  updateAt: Date;
  isReadyToEvaluated: boolean;
  status: "pending" | "evaluating" | "approved" | "rejected";
  summitEvaluationDate?: Date;
  farmerId: string;
};

export type FormEvaluation = {
  id: string;
  number: number;
  evaluatedDate?: Date;
  reason?: string;
  status: "pending" | "evaluating" | "approved" | "rejected";
  registerFormEvaluationId: string;
  registerFormEvaluation: RegisterFormEvaluation;
  docKos06Id: string;
  farmerId: string;
  approveByUserId?: string;
};
