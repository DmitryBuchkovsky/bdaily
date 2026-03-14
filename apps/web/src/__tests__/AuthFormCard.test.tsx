import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import type { UseAuthFormReturn } from "@/hooks/useAuthForm";

beforeEach(() => {
  vi.clearAllMocks();
});

function createMockForm(overrides: Partial<UseAuthFormReturn> = {}): UseAuthFormReturn {
  return {
    isLogin: true,
    toggleMode: vi.fn(),
    email: "",
    setEmail: vi.fn(),
    password: "",
    setPassword: vi.fn(),
    confirmPassword: "",
    setConfirmPassword: vi.fn(),
    name: "",
    setName: vi.fn(),
    teamId: "",
    setTeamId: vi.fn(),
    error: "",
    isLoading: false,
    handleSubmit: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderCard(form: UseAuthFormReturn) {
  return render(
    <MemoryRouter>
      <AuthFormCard form={form} />
    </MemoryRouter>,
  );
}

describe("AuthFormCard", () => {
  it("renders email and password fields in login mode", () => {
    renderCard(createMockForm());
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("shows name and team ID fields in register mode", () => {
    renderCard(createMockForm({ isLogin: false }));
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your-team-id")).toBeInTheDocument();
  });

  it("shows error message when form.error is set", () => {
    renderCard(createMockForm({ error: "Invalid credentials" }));
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows 'Forgot your password?' link in login mode", () => {
    renderCard(createMockForm());
    const link = screen.getByRole("link", { name: "Forgot your password?" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("does NOT show forgot password link in register mode", () => {
    renderCard(createMockForm({ isLogin: false }));
    expect(screen.queryByText("Forgot your password?")).not.toBeInTheDocument();
  });

  it("submit button shows 'Sign in' in login mode, 'Create account' in register mode", () => {
    const { unmount } = renderCard(createMockForm());
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    unmount();

    renderCard(createMockForm({ isLogin: false }));
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("toggle button switches between modes", () => {
    const toggleMode = vi.fn();
    renderCard(createMockForm({ toggleMode }));

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    expect(toggleMode).toHaveBeenCalledOnce();
  });
});
