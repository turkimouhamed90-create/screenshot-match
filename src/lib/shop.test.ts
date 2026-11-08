import { describe, expect, it } from "vitest";
import { formatDZD, WILAYAS } from "./shop";

describe("shop rules", () => {
  it("prices are shown in Algerian dinar", () => {
    expect(formatDZD(2500)).toContain("د.ج");
  });
  it("lists all 58 wilayas", () => {
    expect(WILAYAS).toHaveLength(58);
  });
});
