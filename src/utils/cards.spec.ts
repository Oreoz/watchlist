import { bump, updated } from "./cards";

describe("cards", () => {
  it("bumps the globally stored value", () => {
    expect(updated).toBe(0);

    bump();

    expect(updated).toBe(1);
  });
});
