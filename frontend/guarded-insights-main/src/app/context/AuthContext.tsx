import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/app/services/authService";
import { authStorage } from "@/app/lib/authStorage";
import type { JwtPayload, LoginRequest, RegisterRequest } from "@/app/types";

interface AuthUser {
  email: string;
  username?: string;
  role?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeToken(token: string, fallbackEmail?: string | null): AuthUser {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const email = decoded.email ?? decoded.sub ?? fallbackEmail ?? "";
    return {
      email,
      username: decoded.username,
      role: decoded.role,
    };
  } catch {
    return { email: fallbackEmail ?? "" };
  }
}

function isExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authStorage.getToken();
    if (stored && !isExpired(stored)) {
      setToken(stored);
      setUser(decodeToken(stored, authStorage.getEmail()));
    } else if (stored) {
      authStorage.clear();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authService.login(payload);
    authStorage.setToken(res.token);
    authStorage.setEmail(payload.email);
    setToken(res.token);
    setUser(decodeToken(res.token, payload.email));
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
