import { determineTrend } from "./trends";

describe("trends", () => {
  describe("up", () => {
    it("works", () => {
      const res = determineTrend(0, 1);
      expect(res).toBe("📈");
    });
  });

  describe("down", () => {
    it("works", () => {
      const res = determineTrend(1, 0);
      expect(res).toBe("📉");
    });
  });

  describe("flat", () => {
    it("works", () => {
      const res = determineTrend(1, 1);
      expect(res).toBe("✋");
    });
  });
});
