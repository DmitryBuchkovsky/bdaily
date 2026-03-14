import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useEmailTemplates, useUpdateEmailTemplate } from "@/hooks/useEmailTemplates";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useEmailTemplates", () => {
  it("calls api.get with the correct path", async () => {
    const templates = [{ id: "1", slug: "welcome", name: "Welcome" }];
    mockedApi.get.mockResolvedValueOnce(templates);

    const { result } = renderHook(() => useEmailTemplates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/email-templates");
    expect(result.current.data).toEqual(templates);
  });
});

describe("useUpdateEmailTemplate", () => {
  it("calls api.put with the correct path and input", async () => {
    const updated = { id: "1", slug: "welcome", name: "Updated" };
    mockedApi.put.mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUpdateEmailTemplate(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: "1",
      subject: "New subject",
      bodyHtml: "<p>body</p>",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.put).toHaveBeenCalledWith("/admin/email-templates/1", {
      subject: "New subject",
      bodyHtml: "<p>body</p>",
    });
  });
});
