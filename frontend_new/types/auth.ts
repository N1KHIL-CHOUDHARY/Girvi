export interface UserSummary {
  id: string;
  shopId: string;
  role: "owner" | "worker";
  full_name: string;
  email: string;
  language: "en" | "hi" | "ta";
  permissions: Record<string, boolean>;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}
