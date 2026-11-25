import { describe, expect, it } from "vitest";
import { describeWeather, unitFor, weatherUrl } from "@/lib/weather";

describe("weather", () => {
  it("describes WMO codes the way a weather box would", () => {
    expect(describeWeather(0).label).toBe("Sunny");
    expect(describeWeather(0, false).label).toBe("Clear");
    expect(describeWeather(2).label).toBe("Partly cloudy");
    expect(describeWeather(63).label).toBe("Rain");
    expect(describeWeather(81).label).toBe("Rain");
    expect(describeWeather(75).label).toBe("Snow");
    expect(describeWeather(96).label).toBe("Thunderstorms");
  });

  it("uses Fahrenheit for the US and Celsius elsewhere", () => {
    expect(unitFor("en-US")).toBe("F");
    expect(unitFor("en-GB")).toBe("C");
    expect(unitFor("fr")).toBe("C");
  });

  it("only sends rounded coordinates", () => {
    const url = new URL(weatherUrl({ lat: 39.0997265, lon: -94.5785667 }, "F"));
    expect(url.searchParams.get("latitude")).toBe("39.10");
    expect(url.searchParams.get("longitude")).toBe("-94.58");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });
});
