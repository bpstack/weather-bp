import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useCitySearch } from "@/hooks/useCitySearch";

/**
 * Expectations here are written from how the search *should* behave, not from
 * reading the implementation, so a mismatch is a finding rather than a rule to
 * be rewritten.
 */

// Fresh SWR cache per test, otherwise results leak between them.
const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

function stubGeocoding(results: unknown[] = []) {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results }),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const city = (name: string, country_code = "ES") => ({
  id: name.length,
  name,
  country: "España",
  country_code,
  latitude: 0,
  longitude: 0,
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const typeQuery = async (
  setSearchQuery: (q: string) => void,
  query: string,
) => {
  // One state update per keystroke, as a real user produces.
  for (let i = 1; i <= query.length; i++) {
    await act(async () => {
      setSearchQuery(query.slice(0, i));
    });
  }
};

describe("useCitySearch", () => {
  describe("debounce", () => {
    it("issues a single request for a word typed letter by letter", async () => {
      const fetchMock = stubGeocoding([city("Madrid")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "madrid");

      // Still inside the 300 ms window: nothing should have gone out yet.
      expect(fetchMock).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(String(fetchMock.mock.calls[0][0])).toContain("name=madrid");
    });

    it("does not fire while the user is still typing", async () => {
      const fetchMock = stubGeocoding();
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await act(async () => result.current.setSearchQuery("mad"));
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      await act(async () => result.current.setSearchQuery("madr"));
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // 400 ms elapsed, but never 300 ms without a keystroke.
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("minimum query length", () => {
    it("does not search for fewer than 3 characters", async () => {
      const fetchMock = stubGeocoding();
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "ma");
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("shows popular cities while the query is too short", async () => {
      stubGeocoding();
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "ma");

      expect(result.current.filteredCities.length).toBeGreaterThan(0);
    });
  });

  describe("results", () => {
    it("exposes the geocoding results once they arrive", async () => {
      stubGeocoding([city("Madrid"), city("Madrigal")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() =>
        expect(result.current.filteredCities.map((c) => c.name)).toEqual([
          "Madrid",
          "Madrigal",
        ]),
      );
    });

    it("tags each result with its continent", async () => {
      stubGeocoding([city("Madrid", "ES"), city("Tokio", "JP")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() =>
        expect(result.current.filteredCities.map((c) => c.continent)).toEqual([
          "Europa",
          "Asia",
        ]),
      );
    });

    it("filters results by the selected continent", async () => {
      stubGeocoding([city("Madrid", "ES"), city("Tokio", "JP")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() =>
        expect(result.current.filteredCities).toHaveLength(2),
      );

      await act(async () => result.current.setSelectedContinent("Asia"));

      expect(result.current.filteredCities.map((c) => c.name)).toEqual([
        "Tokio",
      ]);
    });

    it("survives a failing geocoding request without crashing", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => expect(result.current.searchLoading).toBe(false));
      expect(Array.isArray(result.current.filteredCities)).toBe(true);
    });
  });

  describe("feedback while the debounce is pending", () => {
    // KNOWN DEFECT — expected to fail until the hook is fixed.
    //
    // Between the 3rd keystroke and the end of the 300 ms debounce,
    // searchQuery is long enough but debouncedQuery is still empty, so the
    // SWR key is null: searchLoading is false and filteredCities is [].
    // CityModal reads that combination (CityModal.tsx:174-183) as
    // "No se encontraron ciudades" — it tells the user there are no matches
    // before having asked. It should show a loading state instead.
    //
    // it.fails() keeps this red-flagged without breaking the suite: the day
    // the hook is fixed, this test starts failing and must be flipped to it().
    it.fails(
      "should not report 'no results' before the request has gone out",
      async () => {
        stubGeocoding([city("Madrid")]);
        const { result } = renderHook(() => useCitySearch(), { wrapper });

        await typeQuery(result.current.setSearchQuery, "mad");

        const looksLikeNoResults =
          result.current.filteredCities.length === 0 &&
          result.current.searchLoading === false;

        expect(looksLikeNoResults).toBe(false);
      },
    );
  });

  describe("resetSearch", () => {
    it("clears the query and the continent filter", async () => {
      stubGeocoding([city("Madrid")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => result.current.setSelectedContinent("Asia"));
      await act(async () => result.current.resetSearch());

      expect(result.current.searchQuery).toBe("");
      expect(result.current.selectedContinent).toBe("En todo el mundo");
    });

    it("does not re-run the previous search after a reset", async () => {
      const fetchMock = stubGeocoding([city("Madrid")]);
      const { result } = renderHook(() => useCitySearch(), { wrapper });

      await typeQuery(result.current.setSearchQuery, "mad");
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

      await act(async () => result.current.resetSearch());
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it("clears its pending timer on unmount", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    stubGeocoding();
    const { result, unmount } = renderHook(() => useCitySearch(), { wrapper });

    await typeQuery(result.current.setSearchQuery, "mad");
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
