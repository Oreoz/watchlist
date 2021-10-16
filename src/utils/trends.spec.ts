import { determineTrend } from ".";

describe("trends", () => {
  describe("determineTrend", () => {
    it("identifies an increase in price", () => {
      const result = determineTrend(1, 2);

      expect(result).toBe("up");
    });

    it("identifies a decrease in price", () => {
      const result = determineTrend(2, 1);

      expect(result).toBe("down");
    });

    it("identifies same prices", () => {
      const result = determineTrend(1, 1);

      expect(result).toBe("same");
    });
  });
});
