import { movers } from "./movers";

beforeAll(() => {
  movers.push({
    diff: 2.1,
    name: "Splinter Twin",
    percentage: 4.2,
    price: 69,
  });
});

describe("movers", () => {
  it("stores data globally", () => {
    expect(movers).toHaveLength(1);
  });
});
