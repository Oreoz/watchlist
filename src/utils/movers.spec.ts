import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { movers, printTopMovers } from "./movers";

describe("movers", () => {
  beforeEach(() => {
    movers.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints movers sorted by diff and formatted to 2 decimals", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    movers.push(
      {
        diff: 1.5,
        name: "Alpha",
        percentage: 10.129,
        price: 4.567,
      },
      {
        diff: 3.2,
        name: "Beta",
        percentage: 30,
        price: 10,
      },
      {
        diff: 2.1,
        name: "Gamma",
        percentage: 20.2,
        price: 5,
      },
    );

    printTopMovers();

    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith(
      [
        "Beta 10.00$ (30.00%)",
        "Gamma 5.00$ (20.20%)",
        "Alpha 4.57$ (10.13%)",
      ].join("\n"),
    );
  });

  it("limits output to the top 10 movers", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    for (let i = 1; i <= 12; i++) {
      movers.push({
        diff: i,
        name: `Card ${i}`,
        percentage: i,
        price: i,
      });
    }

    printTopMovers();

    const output = logSpy.mock.calls[0]?.[0];
    expect(typeof output).toBe("string");

    const lines = (output as string).split("\n");
    expect(lines).toHaveLength(10);
    expect(lines[0]).toBe("Card 12 12.00$ (12.00%)");
    expect(lines[9]).toBe("Card 3 3.00$ (3.00%)");
  });
});
