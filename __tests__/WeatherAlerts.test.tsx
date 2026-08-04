import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WeatherAlerts from "@/components/weather/sections/WeatherAlerts";
import { makeWeather } from "./fixtures/weather";

/**
 * Pins the current alert thresholds (heat 35, cold 5, wind 30, uv 8,
 * storm >=95, snow 71-77, rain probability 30) and the nowcast rules, so the
 * pending "make thresholds configurable" refactor cannot silently move them.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe("WeatherAlerts", () => {
  it("renders nothing when the weather is calm", () => {
    const { container } = render(<WeatherAlerts weather={makeWeather()} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe("temperature", () => {
    it("fires heat at exactly 35 but not at 34.9", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ current: { temperature_2m: 35 } })}
        />,
      );
      expect(screen.getByText("Calor extremo")).toBeInTheDocument();
      expect(screen.getByText("35°C")).toBeInTheDocument();
    });

    it("stays silent just below the heat threshold", () => {
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({ current: { temperature_2m: 34.9 } })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("fires cold at exactly 5", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ current: { temperature_2m: 5 } })}
        />,
      );
      expect(screen.getByText("Frío intenso")).toBeInTheDocument();
    });

    it("stays silent just above the cold threshold", () => {
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({ current: { temperature_2m: 5.1 } })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("wind and uv", () => {
    it("fires strong wind at 30 km/h and rounds the value", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ current: { wind_speed_10m: 30.4 } })}
        />,
      );
      expect(screen.getByText("Viento fuerte")).toBeInTheDocument();
      expect(screen.getByText("30 km/h")).toBeInTheDocument();
    });

    it("fires extreme UV at index 8", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ daily: { uv_index_max: [8] } })}
        />,
      );
      expect(screen.getByText("UV extremo")).toBeInTheDocument();
      expect(screen.getByText("Índice 8")).toBeInTheDocument();
    });
  });

  describe("weather codes", () => {
    it("fires a thunderstorm alert from code 95", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ current: { weather_code: 95 } })}
        />,
      );
      expect(screen.getByText("Tormenta eléctrica")).toBeInTheDocument();
    });

    it("fires a snow alert inside the 71-77 range only", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({ current: { weather_code: 73 } })}
        />,
      );
      expect(screen.getByText("Nevando")).toBeInTheDocument();
    });

    it("does not treat code 80 (showers) as snow", () => {
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({ current: { weather_code: 80 } })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("rain probability", () => {
    it("fires when any of the next 3 hours reaches 30%", () => {
      render(
        <WeatherAlerts
          weather={makeWeather({
            hourly: {
              precipitation_probability: [10, 45, 20],
              precipitation: [0, 1.2, 0],
            },
          })}
        />,
      );
      expect(screen.getByText("Lluvia probable")).toBeInTheDocument();
      // Reports the peak hour's probability and its matching amount.
      expect(screen.getByText("45% · ~1.2 mm")).toBeInTheDocument();
    });

    it("ignores probabilities below the threshold", () => {
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({
            hourly: { precipitation_probability: [29, 10, 5] },
          })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("only looks at the next 3 hours", () => {
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({
            hourly: {
              time: ["a", "b", "c", "d"],
              precipitation_probability: [0, 0, 0, 90],
              precipitation: [0, 0, 0, 5],
            },
          })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("nowcast", () => {
    // The component compares 15-min slots against `now` shifted by the
    // location's UTC offset, so the clock has to be frozen to a known instant.
    const freezeAt = (utcIso: string) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(utcIso));
    };

    it("announces imminent rain within 5 minutes", () => {
      freezeAt("2026-08-04T09:58:00Z"); // 11:58 local (UTC+2)
      render(
        <WeatherAlerts
          weather={makeWeather({
            minutely_15: {
              time: ["2026-08-04T12:00", "2026-08-04T12:15"],
              precipitation: [0.5, 0.5],
            },
          })}
        />,
      );
      // The 12:00 slot is 2 minutes out, so it is "imminent", not "upcoming".
      expect(screen.getByText("Lluvia inminente")).toBeInTheDocument();
      expect(screen.getByText("En unos minutos · ~0.5 mm")).toBeInTheDocument();
    });

    it("announces upcoming rain with the minutes left", () => {
      freezeAt("2026-08-04T10:00:00Z");
      render(
        <WeatherAlerts
          weather={makeWeather({
            minutely_15: {
              time: ["2026-08-04T12:30"],
              precipitation: [0.4],
            },
          })}
        />,
      );
      expect(screen.getByText("Lluvia próxima")).toBeInTheDocument();
      expect(screen.getByText("En ~30 min · ~0.4 mm")).toBeInTheDocument();
    });

    it("stays quiet when it is already raining", () => {
      freezeAt("2026-08-04T10:00:00Z");
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({
            current: { precipitation: 0.5 },
            minutely_15: {
              time: ["2026-08-04T12:30"],
              precipitation: [0.4],
            },
          })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("ignores slots further out than an hour", () => {
      freezeAt("2026-08-04T10:00:00Z");
      const { container } = render(
        <WeatherAlerts
          weather={makeWeather({
            minutely_15: {
              time: ["2026-08-04T14:00"],
              precipitation: [2],
            },
          })}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("takes precedence over the hourly rain-probability alert", () => {
      freezeAt("2026-08-04T09:58:00Z");
      render(
        <WeatherAlerts
          weather={makeWeather({
            hourly: { precipitation_probability: [90, 90, 90] },
            minutely_15: {
              time: ["2026-08-04T12:00"],
              precipitation: [0.5],
            },
          })}
        />,
      );
      expect(screen.getByText("Lluvia inminente")).toBeInTheDocument();
      expect(screen.queryByText("Lluvia probable")).not.toBeInTheDocument();
    });
  });

  it("stacks every alert that applies at once", () => {
    render(
      <WeatherAlerts
        weather={makeWeather({
          current: { temperature_2m: 40, wind_speed_10m: 50, weather_code: 95 },
          daily: { uv_index_max: [11] },
        })}
      />,
    );

    expect(screen.getByText("Calor extremo")).toBeInTheDocument();
    expect(screen.getByText("Viento fuerte")).toBeInTheDocument();
    expect(screen.getByText("Tormenta eléctrica")).toBeInTheDocument();
    expect(screen.getByText("UV extremo")).toBeInTheDocument();
  });
});
