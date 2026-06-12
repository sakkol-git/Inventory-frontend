import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseApiResponse, ApiShapeError } from "@/lib/api/parseApiResponse";

describe("parseApiResponse", () => {
  it("parses valid data", () => {
    const schema = z.object({ data: z.object({ foo: z.string() }) });
    const data = { data: { foo: "bar" } };
    const parsed = parseApiResponse(schema, data);
    expect(parsed.data.foo).toBe("bar");
  });

  it("throws ApiShapeError on mismatch", () => {
    const schema = z.object({ data: z.object({ foo: z.string() }) });
    const data = { data: { foo: 123 } };
    expect(() => parseApiResponse(schema, data)).toThrow(ApiShapeError);
  });
});
