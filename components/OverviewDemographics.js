"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components (avoid SSR issues)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

export default function OverviewDemographics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ cityStats: [], totalOrders: 0 });
  const [L, setL] = useState(null);

  useEffect(() => {
    // Leaflet runtime + icons (CSS is loaded globally in app/layout.js)
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet.default);
        try {
          delete leaflet.default.Icon.Default.prototype._getIconUrl;
        } catch {}
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/demographics", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load demographics");
        const json = await res.json();
        setData({
          cityStats: json.cityStats || [],
          totalOrders: json.totalOrders || 0,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const defaultCenter = [20.5937, 78.9629]; // India

  const getTileLayerUrl = () =>
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const getTileLayerSubdomains = () => ["a", "b", "c"];

  const createCountIcon = (count) => {
    if (!L) return null;
    // Shopify color scheme for markers
    const color =
      count >= 50
        ? "#D72C0D" // Shopify critical red
        : count >= 20
        ? "#B98900" // Shopify warning amber
        : count >= 10
        ? "#2C6ECB" // Shopify interactive blue
        : "#008060"; // Shopify primary green
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;">${count}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: "var(--shopify-surface)",
        border: "1px solid var(--shopify-border)",
        boxShadow: "var(--shopify-shadow-sm)",
      }}
    >
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderBottom: "1px solid var(--shopify-border)",
        }}
      >
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Customer Demographics
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Geographic distribution of orders
          </p>
          {error && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--shopify-action-critical)" }}
            >
              {error}
            </p>
          )}
        </div>
        <div
          className="rounded-lg px-5 py-3 text-center sm:text-right min-w-[120px]"
          style={{
            backgroundColor: "var(--shopify-bg-primary)",
            border: "1px solid var(--shopify-border)",
          }}
        >
          <div
            className="text-xs font-medium mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Total Orders
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {data.totalOrders}
          </div>
        </div>
      </div>

      <div
        className="h-[420px] relative"
        style={{ backgroundColor: "var(--shopify-bg-primary)" }}
      >
        {loading || !L ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
                style={{
                  border: "3px solid var(--shopify-border)",
                  borderTopColor: "var(--shopify-action-primary)",
                }}
              ></div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Loading map...
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url={getTileLayerUrl()}
              subdomains={getTileLayerSubdomains()}
            />
            {data.cityStats
              .filter((c) => c.coordinates)
              .map((c, idx) => (
                <Marker
                  key={`${c.city}-${c.state}-${idx}`}
                  position={[c.coordinates.lat, c.coordinates.lng]}
                  icon={createCountIcon(c.count)}
                >
                  <Popup>
                    <div className="min-w-[180px] p-1">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {c.city}, {c.state}
                      </div>
                      <div
                        className="text-sm mt-2"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        Orders:{" "}
                        <span
                          className="font-semibold"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {c.count}
                        </span>
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        Zip Codes: {c.zipCodes?.length || 0}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}

        {/* Legend */}
        <div
          className="absolute bottom-4 left-4 rounded-lg p-3.5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            border: "1px solid var(--shopify-border)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="text-xs font-semibold mb-2.5"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Order Volume
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full inline-block flex-shrink-0"
                style={{
                  backgroundColor: "#D72C0D",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              ></span>
              <span
                className="font-medium"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                50+ orders
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full inline-block flex-shrink-0"
                style={{
                  backgroundColor: "#B98900",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              ></span>
              <span
                className="font-medium"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                20-49 orders
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full inline-block flex-shrink-0"
                style={{
                  backgroundColor: "#2C6ECB",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              ></span>
              <span
                className="font-medium"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                10-19 orders
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full inline-block flex-shrink-0"
                style={{
                  backgroundColor: "#008060",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              ></span>
              <span
                className="font-medium"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                &lt;10 orders
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
