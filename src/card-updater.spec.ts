import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CardUpdater } from "./card-updater";
import { get } from "./scryfall";
import { movers } from "./utils";

vi.mock("./scryfall", () => ({
  get: vi.fn(),
}));

const Columns = {
  name: 0,
  foil: 1,
  set: 2,
  number: 3,
  price: 5,
  date: 6,
  trend: 7,
} as const;

type Cell = { value: unknown };

function createWorksheet(initialValues: Partial<Record<number, unknown>> = {}) {
  const cells = new Map<number, Cell>();

  for (const [column, value] of Object.entries(initialValues)) {
    cells.set(Number(column), { value });
  }

  const worksheet = {
    getCell: vi.fn((_row: number, column: number) => {
      if (!cells.has(column)) {
        cells.set(column, { value: undefined });
      }

      return cells.get(column)!;
    }),
  } as unknown as GoogleSpreadsheetWorksheet;

  return {
    worksheet,
    getCell: (column: number) => cells.get(column)!,
  };
}

function createResponse(ok: boolean, payload: unknown): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("CardUpdater", () => {
  const mockedGet = vi.mocked(get);

  beforeEach(() => {
    mockedGet.mockReset();
    movers.length = 0;
  });

  it("throws when set or collector number are missing", async () => {
    const { worksheet } = createWorksheet({
      [Columns.foil]: "No",
      [Columns.set]: "",
      [Columns.number]: "69",
      [Columns.price]: "10",
    });

    await expect(new CardUpdater(worksheet).update(1)).rejects.toThrow(
      "Looks like the current row is empty.",
    );

    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("throws when the card API call fails", async () => {
    const { worksheet } = createWorksheet({
      [Columns.foil]: "No",
      [Columns.set]: "TSR",
      [Columns.number]: "69",
      [Columns.price]: "10",
    });

    mockedGet.mockResolvedValue(createResponse(false, {}));

    await expect(new CardUpdater(worksheet).update(1)).rejects.toThrow(
      "Couldn't fetch the card data from Scryfall: TSR 69.",
    );
  });

  it("updates row values and records upward movers", async () => {
    const today = new Date().toLocaleDateString("en-CA");
    const { worksheet, getCell } = createWorksheet({
      [Columns.foil]: "No",
      [Columns.set]: "TSR",
      [Columns.number]: "69",
      [Columns.price]: "10",
      [Columns.date]: "2025-01-01",
      [Columns.trend]: "same",
    });

    mockedGet.mockResolvedValue(
      createResponse(true, {
        name: "Tarmogoyf",
        prices: {
          usd: "12.5",
          usd_foil: "15",
          usd_etched: "13",
        },
      }),
    );

    await new CardUpdater(worksheet).update(1);

    expect(mockedGet).toHaveBeenCalledWith("TSR", "69");
    expect(getCell(Columns.name).value).toBe("Tarmogoyf");
    expect(getCell(Columns.price).value).toBe(12.5);
    expect(getCell(Columns.date).value).toBe(today);
    expect(getCell(Columns.trend).value).toBe("up");
    expect(movers).toHaveLength(1);
    expect(movers[0]).toMatchObject({
      diff: 2.5,
      name: "Tarmogoyf",
      price: 12.5,
    });
    expect(movers[0].percentage).toBeCloseTo(25, 5);
  });

  it("does not overwrite trend/date when card already updated today", async () => {
    const today = new Date().toLocaleDateString("en-CA");
    const { worksheet, getCell } = createWorksheet({
      [Columns.foil]: "No",
      [Columns.set]: "TSR",
      [Columns.number]: "69",
      [Columns.price]: "10",
      [Columns.date]: today,
      [Columns.trend]: "same",
    });

    mockedGet.mockResolvedValue(
      createResponse(true, {
        name: "Tarmogoyf",
        prices: {
          usd: "8",
          usd_foil: "15",
          usd_etched: "13",
        },
      }),
    );

    await new CardUpdater(worksheet).update(1);

    expect(getCell(Columns.name).value).toBe("Tarmogoyf");
    expect(getCell(Columns.price).value).toBe(8);
    expect(getCell(Columns.date).value).toBe(today);
    expect(getCell(Columns.trend).value).toBe("same");
    expect(movers).toHaveLength(0);
  });

  it.each([
    ["Yes", 15],
    ["Etched", 13],
  ] as const)(
    "uses the correct price source for %s foil values",
    async (foil, expectedPrice) => {
      const { worksheet, getCell } = createWorksheet({
        [Columns.foil]: foil,
        [Columns.set]: "TSR",
        [Columns.number]: "69",
        [Columns.price]: "1",
        [Columns.date]: "2025-01-01",
      });

      mockedGet.mockResolvedValue(
        createResponse(true, {
          name: "Foil Card",
          prices: {
            usd: "8",
            usd_foil: "15",
            usd_etched: "13",
          },
        }),
      );

      await new CardUpdater(worksheet).update(1);

      expect(getCell(Columns.price).value).toBe(expectedPrice);
    },
  );

  it("handles malformed current prices without throwing", async () => {
    const { worksheet, getCell } = createWorksheet({
      [Columns.foil]: "No",
      [Columns.set]: "TSR",
      [Columns.number]: "69",
      [Columns.price]: "not-a-number",
      [Columns.date]: "2025-01-01",
    });

    mockedGet.mockResolvedValue(
      createResponse(true, {
        name: "Tarmogoyf",
        prices: {
          usd: "10",
          usd_foil: "15",
          usd_etched: "13",
        },
      }),
    );

    await expect(new CardUpdater(worksheet).update(1)).resolves.toBeUndefined();
    expect(getCell(Columns.price).value).toBe(10);
    expect(getCell(Columns.trend).value).toBe("same");
    expect(movers).toHaveLength(0);
  });
});
