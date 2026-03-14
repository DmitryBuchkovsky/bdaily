import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormInput } from "@/components/ui/FormInput";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FormInput", () => {
  it("renders with value and placeholder", () => {
    render(<FormInput value="hello" onChange={vi.fn()} placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("hello");
  });

  it("calls onChange with new value on input", () => {
    const onChange = vi.fn();
    render(<FormInput value="" onChange={onChange} placeholder="input" />);
    fireEvent.change(screen.getByPlaceholderText("input"), {
      target: { value: "new" },
    });
    expect(onChange).toHaveBeenCalledWith("new");
  });

  it("defaults to type text", () => {
    render(<FormInput value="" onChange={vi.fn()} placeholder="default" />);
    expect(screen.getByPlaceholderText("default")).toHaveAttribute("type", "text");
  });

  it("accepts type date", () => {
    render(<FormInput value="" onChange={vi.fn()} type="date" placeholder="date" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "date");
  });
});
