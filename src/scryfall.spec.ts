import { get } from "./scryfall";
import fetch from "jest-fetch-mock";

describe("scryfall", () => {
  describe("get", () => {
    it("works", async () => {
      fetch.mockResponseOnce(JSON.stringify({ name: "Tarmogoyf" }));

      const res = await get("TSR", "69");
      const json = await res.json();

      expect(json.name).toBe("Tarmogoyf");
    });
  });
});
