import { movers } from "./movers";

beforeAll(() => {
  movers.push({
    name: "",
    diff: "2.12$",
    percentage: "4.20%",
  });
});

describe("movers", () => {
  it("stores data globally", () => {
    expect(movers).toHaveLength(1);
  });
});
