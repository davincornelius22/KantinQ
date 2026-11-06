import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { logger } from "../utils/logger";

const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Simulated rendering crash for Budi Santoso (NIM 21012345)");
  }
  return <div>Normal App Content</div>;
};

describe("ErrorBoundary", () => {
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error in tests for expected thrown error
    vi.spyOn(console, "error").mockImplementation(() => {});
    loggerErrorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Normal App Content")).toBeInTheDocument();
  });

  it("catches errors, renders fallback UI, and does not show raw stack traces", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Friendly Indonesian error UI
    expect(
      screen.getByText("Terjadi Kesalahan pada Aplikasi")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Perlindungan Keamanan Pengguna/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Detail teknis internal dan jejak stack trace disembunyikan/i
      )
    ).toBeInTheDocument();

    // Verify raw error / stack is NOT displayed to the user
    expect(
      screen.queryByText(/Simulated rendering crash/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/at ProblemChild/)).not.toBeInTheDocument();

    // Verify buttons are rendered
    expect(
      screen.getByRole("button", { name: /Muat Ulang/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Beranda/i })).toBeInTheDocument();

    // Verify logger.error was called
    expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it("resets state when reset button is clicked", () => {
    const handleReset = vi.fn();
    render(
      <ErrorBoundary onReset={handleReset}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeBtn = screen.getByRole("button", { name: /Beranda/i });
    fireEvent.click(homeBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

