import { get } from "./scryfall";
import { setupServer } from "msw/node";
import { http } from "msw";

const server = setupServer();

describe("scryfall", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  describe("get request", () => {
    it("works", async () => {
      server.use(
        http.get("https://api.scryfall.com/cards/TSR/69", () => {
          return new Response(JSON.stringify({ name: "Tarmogoyf" }));
        })
      );

      const res = await get("TSR", "69");

      expect(res.status).toBe(200);

      const json = await res.json();

      expect(json.name).toBe("Tarmogoyf");
    });
  });
});
