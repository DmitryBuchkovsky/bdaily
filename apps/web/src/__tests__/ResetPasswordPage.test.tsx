import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockedApi = api as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function renderPage(initialRoute = "/reset-password?token=abc123") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ResetPasswordPage />
    </MemoryRouter>,
  );
}

describe("ResetPasswordPage", () => {
  it("renders password fields", () => {
    renderPage();
    expect(screen.getByPlaceholderText("At least 8 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re-enter your password")).toBeInTheDocument();
  });

  it("shows warning when no token in URL", () => {
    renderPage("/reset-password");
    expect(
      screen.getByText("This reset link appears to be invalid. Please request a new one."),
    ).toBeInTheDocument();
  });

  it("validates password length (min 8)", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  it("validates passwords match", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows success after valid submission", async () => {
    mockedApi.post.mockResolvedValueOnce({});
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(screen.getByText("Password reset successfully")).toBeInTheDocument();
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/reset-password", {
      token: "abc123",
      newPassword: "newpassword1",
    });
  });

  it("has link back to login", () => {
    renderPage();
    const link = screen.getByRole("link", { name: "Back to login" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
