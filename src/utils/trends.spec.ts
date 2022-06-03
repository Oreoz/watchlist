import { determineTrend } from "./trends";

describe("trends", () => {
  describe("up", () => {
    it("works with ints", () => {
      const res = determineTrend(0, 1);
      expect(res).toBe("up");
    });

    it("works with floats", () => {
      const res = determineTrend(0.1, 0.2);
      expect(res).toBe("up");
    });
  });

  describe("down", () => {
    it("works with ints", () => {
      const res = determineTrend(1, 0);
      expect(res).toBe("down");
    });

    it("works with floats", () => {
      const res = determineTrend(0.2, 0.1);
      expect(res).toBe("down");
    });
  });

  describe("flat", () => {
    it("works with ints", () => {
      const res = determineTrend(1, 1);
      expect(res).toBe("same");
    });

    it("works with floats", () => {
      const res = determineTrend(1.2, 1.2);
      expect(res).toBe("same");
    });
  });
});
