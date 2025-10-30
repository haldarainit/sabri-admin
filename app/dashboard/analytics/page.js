"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [topCountries, setTopCountries] = useState([]);
  const [topCities, setTopCities] = useState([]);

  // averageSessionDuration removed — we no longer display engagement time here
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topPages, setTopPages] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [realtimeSources, setRealtimeSources] = useState([]);
  const [sourcesRange, setSourcesRange] = useState("realtime");
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [loadingActiveCard, setLoadingActiveCard] = useState(false);
  const [loadingCountriesCard, setLoadingCountriesCard] = useState(false);
  const [loadingCitiesCard, setLoadingCitiesCard] = useState(false);
  const [loadingEventsCard, setLoadingEventsCard] = useState(false);
  const [engagement, setEngagement] = useState(null);

  // Small three-dot loader used when a single card is refreshing
  const ThreeDots = () => (
    <div className="flex items-center justify-center py-6">
      <span
        className="inline-block w-2 h-2 rounded-full animate-bounce"
        style={{
          animationDelay: "0s",
          backgroundColor: "var(--shopify-action-primary)",
          opacity: 0.6,
        }}
      ></span>
      <span
        className="inline-block w-2 h-2 rounded-full mx-2 animate-bounce"
        style={{
          animationDelay: "0.15s",
          backgroundColor: "var(--shopify-action-primary)",
          opacity: 0.6,
        }}
      ></span>
      <span
        className="inline-block w-2 h-2 rounded-full animate-bounce"
        style={{
          animationDelay: "0.3s",
          backgroundColor: "var(--shopify-action-primary)",
          opacity: 0.6,
        }}
      ></span>
    </div>
  );

  const fetchRealtimeData = async (range = undefined) => {
    try {
      setRefreshing(true);
      const isRangeFetch = typeof range !== "undefined";
      if (isRangeFetch) setSourcesLoading(true);
      const effectiveRange = range ?? sourcesRange;
      const qs = effectiveRange
        ? `?range=${encodeURIComponent(effectiveRange)}`
        : "";
      const response = await fetch(`/api/analytics/realtime${qs}`);
      if (response.ok) {
        const payload = await response.json();
        const data = payload.data || {};
        setTotalActiveUsers(data.totalActiveUsers || 0);
        setTopCountries(data.topCountries || []);
        setTopCities(data.topCities || []);
        setTopEvents(data.topEvents || []);
        setRealtimeSources(data.realtimeSources || []);
        setEngagement(data.engagement || null);
      } else {
        console.error(
          "Failed to fetch realtime analytics, status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error fetching realtime analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSourcesLoading(false);
    }
  };

  // Refresh only a specific card by fetching the realtime route and updating the relevant slice
  const refreshSection = async (section) => {
    try {
      // set appropriate loading flag
      if (section === "active") setLoadingActiveCard(true);
      if (section === "countries") setLoadingCountriesCard(true);
      if (section === "cities") setLoadingCitiesCard(true);
      if (section === "events") setLoadingEventsCard(true);
      if (section === "sources") setSourcesLoading(true);

      const qs =
        section === "sources"
          ? `?range=${encodeURIComponent(sourcesRange)}`
          : "";
      const response = await fetch(`/api/analytics/realtime${qs}`);
      if (response.ok) {
        const payload = await response.json();
        const data = payload.data || {};

        switch (section) {
          case "active":
            setTotalActiveUsers(data.totalActiveUsers || 0);
            break;
          case "countries":
            setTopCountries(data.topCountries || []);
            break;
          case "cities":
            setTopCities(data.topCities || []);
            break;
          case "events":
            setTopEvents(data.topEvents || []);
            break;
          case "sources":
            setRealtimeSources(data.realtimeSources || []);
            break;
          default:
            break;
        }
      } else {
        console.error(
          "Failed to fetch section",
          section,
          "status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error refreshing section", section, error);
    } finally {
      if (section === "active") setLoadingActiveCard(false);
      if (section === "countries") setLoadingCountriesCard(false);
      if (section === "cities") setLoadingCitiesCard(false);
      if (section === "events") setLoadingEventsCard(false);
      if (section === "sources") setSourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    // Auto-refresh removed — manual Refresh button available
  }, []);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{
              border: "3px solid var(--shopify-border)",
              borderTopColor: "var(--shopify-action-primary)",
            }}
          ></div>
          <p
            className="font-medium"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--shopify-text-primary)" }}
        >
          Analytics
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--shopify-text-secondary)" }}
        >
          View real-time active users, top countries, and top cities
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Active Users Card */}
        <div
          className="relative rounded-lg border p-8 pb-14 flex flex-col items-center justify-center"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Real-time
          </div>
          {loadingActiveCard ? (
            <ThreeDots />
          ) : (
            <div
              className="text-5xl font-bold mb-2"
              style={{ color: "var(--shopify-action-primary)" }}
            >
              {totalActiveUsers || 0}
            </div>
          )}
          <div
            className="text-base font-medium mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Active Users
          </div>
          <button
            onClick={() => refreshSection("active")}
            disabled={loadingActiveCard}
            title="Refresh Active Users"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg transition-colors flex items-center justify-center border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              color: "var(--shopify-action-interactive)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            <svg
              className={`${loadingActiveCard ? "animate-spin" : ""} w-4 h-4`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 10-9 9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 3v6h-6"
              />
            </svg>
          </button>
        </div>

        {/* Top Countries Card */}
        <div
          className="relative rounded-lg border p-6 pb-14"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div
            className="text-base font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Top Countries (last 30 minutes)
          </div>
          {loadingCountriesCard ? (
            <ThreeDots />
          ) : topCountries && topCountries.length > 0 ? (
            <ul className="space-y-2">
              {topCountries.map((c, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {c.country}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--shopify-action-primary)" }}
                  >
                    {c.users}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="text-sm text-center py-8"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              No active countries to show
            </div>
          )}

          <button
            onClick={() => refreshSection("countries")}
            disabled={loadingCountriesCard}
            title="Refresh Countries"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg transition-colors flex items-center justify-center border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              color: "var(--shopify-action-interactive)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            <svg
              className={`${
                loadingCountriesCard ? "animate-spin" : ""
              } w-4 h-4`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 10-9 9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 3v6h-6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Top Cities Card - full width */}
      <div
        className="relative rounded-lg border p-6 pb-14"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div
          className="text-base font-semibold mb-4"
          style={{ color: "var(--shopify-text-primary)" }}
        >
          Top Cities (last 30 minutes)
        </div>
        {loadingCitiesCard ? (
          <ThreeDots />
        ) : topCities && topCities.length > 0 ? (
          <ul className="space-y-2">
            {topCities.map((c, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center rounded-lg px-4 py-3 border"
                style={{
                  backgroundColor: "var(--shopify-bg-primary)",
                  borderColor: "var(--shopify-border)",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  {c.city}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--shopify-action-primary)" }}
                >
                  {c.users}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="text-sm text-center py-8"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            No active cities to show
          </div>
        )}

        <button
          onClick={() => refreshSection("cities")}
          disabled={loadingCitiesCard}
          title="Refresh Cities"
          className="absolute bottom-3 right-3 w-8 h-8 rounded-lg transition-colors flex items-center justify-center border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
            color: "var(--shopify-action-interactive)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--shopify-surface-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
          }
        >
          <svg
            className={`${loadingCitiesCard ? "animate-spin" : ""} w-4 h-4`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 10-9 9"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 3v6h-6"
            />
          </svg>
        </button>
      </div>

      {/* Realtime additional cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Events */}
        <div
          className="relative rounded-lg border p-6 pb-14"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div
            className="text-base font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Top Events (realtime)
          </div>
          {loadingEventsCard ? (
            <ThreeDots />
          ) : topEvents && topEvents.length > 0 ? (
            <ul className="space-y-2">
              {topEvents.map((e, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                >
                  <div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {e.eventName
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold ml-4"
                    style={{ color: "var(--shopify-action-primary)" }}
                  >
                    {e.count}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="text-sm text-center py-8"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              No events to show
            </div>
          )}

          <button
            onClick={() => refreshSection("events")}
            disabled={loadingEventsCard}
            title="Refresh Events"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg transition-colors flex items-center justify-center border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              color: "var(--shopify-action-interactive)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            <svg
              className={`${loadingEventsCard ? "animate-spin" : ""} w-4 h-4`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 10-9 9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 3v6h-6"
              />
            </svg>
          </button>
        </div>

        {/* Realtime Sources */}
        <div
          className="relative rounded-lg border p-6 pb-14"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Realtime Sources
            </div>
            <div>
              <select
                value={sourcesRange}
                onChange={(e) => {
                  setSourcesRange(e.target.value);
                  fetchRealtimeData(e.target.value);
                }}
                disabled={sourcesLoading}
                className="rounded-lg px-3 py-1.5 border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              >
                <option value="realtime">Realtime (last 30m)</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this week">This week</option>
                <option value="last week">Last week</option>
                <option value="last 7 days">Last 7 days</option>
                <option value="last 14 days">Last 14 days</option>
                <option value="last 28 days">Last 28 days</option>
                <option value="last 30 days">Last 30 days</option>
                <option value="last 60 days">Last 60 days</option>
              </select>
            </div>
          </div>
          {sourcesLoading ? (
            <ThreeDots />
          ) : realtimeSources && realtimeSources.length > 0 ? (
            <ul className="space-y-2">
              {realtimeSources.map((s, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                >
                  <div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {s.source
                        ? s.source.charAt(0).toUpperCase() + s.source.slice(1)
                        : ""}
                      {s.medium ? ` / ${s.medium}` : ""}
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold ml-4"
                    style={{ color: "var(--shopify-action-primary)" }}
                  >
                    {s.users}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="text-sm text-center py-8"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              No sources to show
            </div>
          )}

          <button
            onClick={() => refreshSection("sources")}
            disabled={sourcesLoading}
            title="Refresh Sources"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg transition-colors flex items-center justify-center border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              color: "var(--shopify-action-interactive)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            <svg
              className={`${sourcesLoading ? "animate-spin" : ""} w-4 h-4`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 10-9 9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 3v6h-6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
