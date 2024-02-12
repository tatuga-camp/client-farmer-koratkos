export type User = {
  id: string;
  createAt: string;
  updateAt: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  picture: string;
  phone: string;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: string;
  role: "evaluator" | "committee" | "organizer";
  organization: string;
  userCreateKeyId: string;
};
