import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("PageInfoBlock", () => {
  it("renders title and description", () => {
    render(<PageInfoBlock title="Hello" description="World" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders tips when provided", () => {
    render(<PageInfoBlock title="T" description="D" tips={["Tip one", "Tip two"]} />);
    expect(screen.getByText("Tip one")).toBeInTheDocument();
    expect(screen.getByText("Tip two")).toBeInTheDocument();
  });

  it("does not render tips when empty array", () => {
    const { container } = render(<PageInfoBlock title="T" description="D" tips={[]} />);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("dismiss button hides the component", () => {
    render(<PageInfoBlock title="Dismissable" description="D" />);
    expect(screen.getByText("Dismissable")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(screen.queryByText("Dismissable")).not.toBeInTheDocument();
  });

  it("saves dismissed state to localStorage when storageKey provided", () => {
    render(<PageInfoBlock title="T" description="D" storageKey="test-block" />);
    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(localStorage.getItem("bdaily-info-dismissed-test-block")).toBe("1");
  });

  it("starts dismissed if localStorage has '1' for the key", () => {
    localStorage.setItem("bdaily-info-dismissed-already-seen", "1");
    render(<PageInfoBlock title="Should not appear" description="D" storageKey="already-seen" />);
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("works without storageKey (no localStorage interaction)", () => {
    render(<PageInfoBlock title="No key" description="D" />);
    fireEvent.click(screen.getByTitle("Dismiss"));

    expect(screen.queryByText("No key")).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
});
