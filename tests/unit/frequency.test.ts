import { describe, expect, it } from "vitest";
import { currentEdition, fromDateKey, toDateKey } from "@/lib/frequency";

const at = (s: string) => new Date(`${s}T15:00:00`); // mid-afternoon local time

describe("currentEdition", () => {
  it("starts at edition No. 1 on the start date", () => {
    const slot = currentEdition("weekly", "2026-11-02", at("2026-11-02"));
    expect(slot.number).toBe(1);
    expect(slot.key).toBe("2026-11-02");
    expect(toDateKey(slot.next)).toBe("2026-11-09");
  });

  it("keeps the same weekly edition until the next publish day", () => {
    expect(currentEdition("weekly", "2026-11-02", at("2026-11-08")).key).toBe("2026-11-02");
    const next = currentEdition("weekly", "2026-11-02", at("2026-11-09"));
    expect(next).toMatchObject({ number: 2, key: "2026-11-09" });
  });

  it("prints a new daily edition every day", () => {
    const slot = currentEdition("daily", "2026-11-20", at("2026-11-24"));
    expect(slot).toMatchObject({ number: 5, key: "2026-11-24" });
    expect(toDateKey(slot.next)).toBe("2026-11-25");
  });

  it("counts biweekly editions in 14-day periods", () => {
    expect(currentEdition("biweekly", "2026-11-01", at("2026-11-14")).number).toBe(1);
    expect(currentEdition("biweekly", "2026-11-01", at("2026-11-15"))).toMatchObject({ number: 2, key: "2026-11-15" });
  });

  it("clamps monthly editions to the end of shorter months", () => {
    // Started on the 31st: February has no 31st, so that edition lands on the 28th.
    const feb = currentEdition("monthly", "2027-01-31", at("2027-02-28"));
    expect(feb).toMatchObject({ number: 2, key: "2027-02-28" });
    expect(toDateKey(feb.next)).toBe("2027-03-31");
    expect(currentEdition("monthly", "2027-01-31", at("2027-02-27")).key).toBe("2027-01-31");
  });

  it("never returns an edition before the start date", () => {
    expect(currentEdition("weekly", "2026-12-01", at("2026-11-20")).number).toBe(1);
  });

  it("round-trips date keys in local time", () => {
    expect(toDateKey(fromDateKey("2026-03-08"))).toBe("2026-03-08");
  });
});
