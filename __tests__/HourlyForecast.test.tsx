import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HourlyForecast from "@/components/weather/sections/HourlyForecast";
import { makeWeather } from "./fixtures/weather";

const formatTemp = (t: number | null) =>
  t === null ? "-" : String(Math.round(t));

function renderHourly(weather: ReturnType<typeof makeWeather>) {
  return render(
    <HourlyForecast weather={weather} formatTemp={formatTemp} tempUnit="C" />,
  );
}

describe("HourlyForecast", () => {
  it('shows the current conditions on "Ahora", like the card above it', () => {
    renderHourly(
      makeWeather({
        current: { temperature_2m: 19, weather_code: 3 },
        hourly: { temperature_2m: [21, 23, 24], weather_code: [0, 0, 0] },
      }),
    );
    expect(
      screen.getByRole("button", { name: "Ahora: 19°, Nublado, 0% de lluvia" }),
    ).toBeInTheDocument();
  });

  it("shows each later hour's own forecast, not one guessed from rain odds", () => {
    renderHourly(
      makeWeather({
        current: { weather_code: 0 },
        hourly: {
          // 13:00 is forecast as light rain with low odds; 14:00 as overcast
          // with high odds. Each hour must show what the model says for it.
          weather_code: [0, 61, 3],
          precipitation_probability: [0, 10, 70],
        },
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "13:00: 23°, Lluvia ligera, 10% de lluvia",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "14:00: 24°, Nublado, 70% de lluvia",
      }),
    ).toBeInTheDocument();
  });
});
