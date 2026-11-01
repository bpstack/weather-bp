import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Forecast from "@/components/weather/sections/Forecast";
import { makeWeather } from "./fixtures/weather";

const formatTemp = (t: number | null) =>
  t === null ? "-" : String(Math.round(t));

const ORIGINAL_TZ = process.env.TZ;

afterEach(() => {
  process.env.TZ = ORIGINAL_TZ;
});

/**
 * Open-Meteo returns `null` for the last forecast day when the model run does
 * not reach the end of the location's local day (seen live for Sydney and
 * Tokyo with forecast_days=16). Such a day has no data to show.
 */
function withTrailingNullDay() {
  return makeWeather({
    daily: {
      time: ["2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17"],
      temperature_2m_max: [21, 22, 25, null],
      temperature_2m_min: [13, 15, 15, null],
      weather_code: [0, 51, 51, null],
    },
  });
}

function renderForecast(weather = withTrailingNullDay()) {
  return render(
    <Forecast
      weather={weather}
      forecastDays={16}
      setForecastDays={() => {}}
      formatTemp={formatTemp}
    />,
  );
}

describe("Forecast", () => {
  it("does not show a day without data as 0°", () => {
    renderForecast();
    expect(screen.queryByText("0°")).not.toBeInTheDocument();
    expect(screen.queryByText("Desconocido")).not.toBeInTheDocument();
    expect(screen.queryByText("17 nov")).not.toBeInTheDocument();
  });

  it("scales the range bars to the days that have data", () => {
    renderForecast();
    // The coldest real minimum (13°) must sit at the left edge of the scale.
    const coldestBar = screen.getByTitle("13° – 21°").firstElementChild;
    expect((coldestBar as HTMLElement).style.left).toBe("0%");
  });

  it("labels each day by its own calendar date west of UTC", () => {
    // A date-only string parsed as UTC midnight is still the previous day in
    // New York, which used to shift every label back by one.
    process.env.TZ = "America/New_York";
    renderForecast(
      makeWeather({
        daily: {
          time: ["2026-11-02", "2026-11-03"],
          temperature_2m_max: [20, 21],
          temperature_2m_min: [10, 11],
          weather_code: [0, 0],
        },
      }),
    );
    expect(screen.getByText("Hoy")).toBeInTheDocument();
    expect(screen.getByText("2 nov")).toBeInTheDocument();
    expect(screen.getByText("3 nov")).toBeInTheDocument();
    expect(screen.getByText("mar")).toBeInTheDocument(); // 3 Nov 2026 is a Tuesday
  });
});
