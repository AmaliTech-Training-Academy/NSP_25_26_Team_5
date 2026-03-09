import { useEffect, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import {
  AuthUser,
  RegisterRequest,
} from "../../features/auth/types/auth.types";
import { authApi } from "../../features/auth/api/auth.api";
import { authStorage } from "../../features/auth/utils/auth.storage";
import { AuthProviderProps } from "./AuthProvider.type";

const readStoredUser = (): AuthUser | null => {
  try {
    const parsed = authStorage.getUser<Partial<AuthUser>>();
    if (
      !parsed ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string"
    ) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
};

const persistAuth = (userData: AuthUser, authToken: string): void => {
  authStorage.setToken(authToken);
  authStorage.setUser(userData);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    setUser(readStoredUser());
  }, [token]);

  const login = (userData: AuthUser, authToken: string): void => {
    persistAuth(userData, authToken);
    setUser(userData);
    setToken(authToken);
  };

  const register = async (payload: RegisterRequest): Promise<void> => {
    const response = await authApi.register(payload);
    const userData: AuthUser = {
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
    };

    login(userData, response.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
