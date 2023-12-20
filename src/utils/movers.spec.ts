import { movers } from "./movers";

beforeAll(() => {
  movers.push({
    name: "",
    diff: 0,
    percentage: 0,
  });
});

describe("movers", () => {
  it("stores data globally", () => {
    expect(movers).toHaveLength(1);
  });
});
