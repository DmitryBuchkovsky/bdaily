import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  createElement,
  type ReactNode,
} from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "ADMIN" | "MEMBER";
  teamId?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    teamId: string,
  ) => Promise<void>;
  logout: () => void;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeAuth(tokens: AuthTokens): void {
  localStorage.setItem("access_token", tokens.accessToken);
  localStorage.setItem("refresh_token", tokens.refreshToken);
  localStorage.setItem("user", JSON.stringify(tokens.user));
}

function clearAuth(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const stored = loadStoredUser();
    if (token && stored) {
      setUser(stored);
    } else if (!token) {
      clearAuth();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthTokens>("/auth/login", {
      email,
      password,
    });
    storeAuth(result);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string, teamId: string) => {
      const result = await api.post<AuthTokens>("/auth/register", {
        email,
        password,
        name,
        teamId,
      });
      storeAuth(result);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return createElement(
    AuthContext.Provider,
    {
      value: { user, isAuthenticated: !!user, isLoading, login, register, logout },
    },
    children,
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
