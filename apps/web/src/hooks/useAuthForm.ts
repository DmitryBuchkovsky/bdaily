import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";

export interface UseAuthFormReturn {
  isLogin: boolean;
  toggleMode: () => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  teamId: string;
  setTeamId: (v: string) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: () => Promise<void>;
}

export function useAuthForm(onSuccess: () => void): UseAuthFormReturn {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, teamId);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [isLogin, email, password, name, teamId, login, register, onSuccess]);

  return {
    isLogin,
    toggleMode,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    teamId,
    setTeamId,
    error,
    isLoading,
    handleSubmit,
  };
}
