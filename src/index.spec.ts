import { beforeEach, describe, expect, it, vi } from "vitest";

describe("index entrypoint", () => {
  const originalEnv = {
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  };

  beforeEach(() => {
    vi.resetModules();

    process.env.GOOGLE_PRIVATE_KEY = "private-key";
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "service@account.test";
    process.env.SPREADSHEET_ID = "spreadsheet-id";
  });

  it("processes sheets in batches and stops when an update fails", async () => {
    const update = vi.fn(async (row: number) => {
      if (row === 21) {
        throw new Error("stop");
      }
    });

    const worksheet = {
      loadCells: vi.fn().mockResolvedValue(undefined),
      saveUpdatedCells: vi.fn().mockResolvedValue(undefined),
    };

    const spreadsheet = {
      loadInfo: vi.fn().mockResolvedValue(undefined),
      sheetCount: 1,
      sheetsByIndex: [worksheet],
    };

    const jwt = {};
    const JWT = vi.fn().mockImplementation(() => jwt);
    const GoogleSpreadsheet = vi.fn().mockImplementation(() => spreadsheet);
    const CardUpdater = vi.fn().mockImplementation(() => ({ update }));
    const wait = vi.fn().mockResolvedValue(undefined);
    const printTopMovers = vi.fn();

    const spinner = {
      start: vi.fn(),
      succeed: vi.fn(),
      suffixText: "",
    };
    spinner.start.mockReturnValue(spinner);
    const ora = vi.fn().mockReturnValue(spinner);

    vi.doMock("dotenv/config", () => ({}));
    vi.doMock("google-auth-library", () => ({ JWT }));
    vi.doMock("google-spreadsheet", () => ({ GoogleSpreadsheet }));
    vi.doMock("./card-updater", () => ({ CardUpdater }));
    vi.doMock("./utils", () => ({
      printTopMovers,
      updated: 7,
      wait,
    }));
    vi.doMock("ora", () => ({ default: ora }));

    await import("./index");

    await vi.waitFor(() => {
      expect(printTopMovers).toHaveBeenCalledOnce();
    });

    expect(JWT).toHaveBeenCalledWith({
      email: "service@account.test",
      key: "private-key",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    expect(GoogleSpreadsheet).toHaveBeenCalledWith("spreadsheet-id", jwt);
    expect(spreadsheet.loadInfo).toHaveBeenCalledOnce();

    expect(CardUpdater).toHaveBeenCalledOnce();
    expect(CardUpdater).toHaveBeenCalledWith(worksheet);

    expect(worksheet.loadCells).toHaveBeenNthCalledWith(1, "A1:H21");
    expect(worksheet.loadCells).toHaveBeenNthCalledWith(2, "A21:H41");
    expect(worksheet.saveUpdatedCells).toHaveBeenCalledTimes(2);

    expect(update).toHaveBeenCalledTimes(21);
    expect(wait).toHaveBeenCalledTimes(20);
    expect(wait).toHaveBeenNthCalledWith(1, 50);

    expect(spinner.suffixText).toBe("(7 cards processed)");
    expect(spinner.succeed).toHaveBeenCalledWith("Done updating prices.");
  });

  afterEach(() => {
    process.env.GOOGLE_PRIVATE_KEY = originalEnv.GOOGLE_PRIVATE_KEY;
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL =
      originalEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    process.env.SPREADSHEET_ID = originalEnv.SPREADSHEET_ID;
  });
});
