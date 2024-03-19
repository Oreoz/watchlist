import { movers } from "./movers";

beforeAll(() => {
  movers.push({
    diff: 2.1,
    dollars: "2.10$",
    name: "Splinter Twin",
    percentage: "4.20%",
  });
});

describe("movers", () => {
  it("stores data globally", () => {
    expect(movers).toHaveLength(1);
  });
});
