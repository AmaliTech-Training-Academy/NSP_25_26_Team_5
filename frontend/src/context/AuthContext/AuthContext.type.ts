import { AuthUser, RegisterRequest } from "../../features/auth/types/auth.types";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser, authToken: string) => void;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}
