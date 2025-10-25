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
    const color =
      count >= 50
        ? "#dc2626"
        : count >= 20
        ? "#ea580c"
        : count >= 10
        ? "#d97706"
        : "#16a34a";
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px;">${count}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            Customer Demographics
          </h3>
          <p className="text-sm text-gray-400">
            Geographic distribution of orders
          </p>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Orders</div>
          <div className="text-2xl font-bold text-gray-100">
            {data.totalOrders}
          </div>
        </div>
      </div>

      <div className="h-[420px] relative">
        {loading || !L ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6b4f3a] mx-auto mb-3"></div>
              <p className="text-gray-300 text-sm">Loading map…</p>
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
                    <div className="min-w-[180px]">
                      <div className="font-semibold text-gray-900">
                        {c.city}, {c.state}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        Orders: <span className="font-medium">{c.count}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Zip Codes: {c.zipCodes?.length || 0}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-3 shadow">
          <div className="text-xs font-semibold text-gray-900 mb-1">
            Order Volume
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              50+ orders
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
              20-49 orders
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              10-19 orders
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              &lt;10 orders
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
