"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Users, TrendingUp, Filter } from "lucide-react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function DemographicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demographicsData, setDemographicsData] = useState({
    cityStats: [],
    stateStats: [],
    totalOrders: 0,
    uniqueLocations: 0,
    topCities: [],
  });
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [mapView, setMapView] = useState("street");
  const [L, setL] = useState(null);

  // Load Leaflet and fix icon issue
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet.default);

        // Fix default marker icon
        delete leaflet.default.Icon.Default.prototype._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });

      // Import Leaflet CSS
      import("leaflet/dist/leaflet.css");
    }
  }, []);

  useEffect(() => {
    fetchDemographicsData();
  }, []);

  const fetchDemographicsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/demographics");
      if (!response.ok) {
        throw new Error("Failed to fetch demographics data");
      }
      const data = await response.json();
      setDemographicsData(data);
    } catch (err) {
      console.error("Error fetching demographics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomIcon = (count) => {
    if (!L) return null;

    const getColor = (count) => {
      if (count >= 50) return "#dc2626"; // red
      if (count >= 20) return "#ea580c"; // orange
      if (count >= 10) return "#d97706"; // yellow
      return "#16a34a"; // green
    };

    const color = getColor(count);

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${count}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const filteredCityStats = demographicsData.cityStats.filter((city) => {
    if (selectedState !== "all" && city.state !== selectedState) return false;
    if (selectedCity !== "all" && city.city !== selectedCity) return false;
    return true;
  });

  // India center coordinates
  const defaultCenter = [20.5937, 78.9629];

  const getTileLayerUrl = () => {
    switch (mapView) {
      case "satellite":
        return "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
      case "terrain":
        return "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  const getTileLayerSubdomains = () => {
    return mapView === "street"
      ? ["a", "b", "c"]
      : ["mt0", "mt1", "mt2", "mt3"];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b4f3a] mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">
            Loading demographics data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchDemographicsData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            Customer Demographics
          </h1>
          <p className="text-gray-400 mt-1">
            Geographic distribution of orders and customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                {demographicsData.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Cities</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                {demographicsData.cityStats.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">States Covered</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                {demographicsData.stateStats.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Top City Orders</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                {demographicsData.topCities[0]?.count || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {demographicsData.topCities[0]?.city || "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a]"
                >
                  <option value="all">All States</option>
                  {demographicsData.stateStats.map((state) => (
                    <option key={state.state} value={state.state}>
                      {state.state} ({state.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a]"
                >
                  <option value="all">All Cities</option>
                  {demographicsData.cityStats
                    .filter(
                      (city) =>
                        selectedState === "all" || city.state === selectedState
                    )
                    .map((city) => (
                      <option
                        key={`${city.city}-${city.state}`}
                        value={city.city}
                      >
                        {city.city} ({city.count})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Map View
                </label>
                <select
                  value={mapView}
                  onChange={(e) => setMapView(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a]"
                >
                  <option value="street">Street</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top Cities List */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Top Cities by Orders
            </h3>
            <div className="space-y-3">
              {demographicsData.topCities.slice(0, 10).map((city, index) => (
                <div
                  key={`${city.city}-${city.state}-${index}`}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-gray-300">{city.city}</span>
                  </div>
                  <span className="font-semibold text-[#6b4f3a]">
                    {city.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="h-[600px] relative">
            {L && (
              <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={getTileLayerUrl()}
                  subdomains={getTileLayerSubdomains()}
                />

                {filteredCityStats.map(
                  (city, index) =>
                    city.coordinates && (
                      <Marker
                        key={`${city.city}-${city.state}-${index}`}
                        position={[city.coordinates.lat, city.coordinates.lng]}
                        icon={createCustomIcon(city.count)}
                      >
                        <Popup>
                          <div className="p-2 min-w-[180px]">
                            <h4 className="font-bold text-gray-900 mb-2">
                              {city.city}, {city.state}
                            </h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">
                                  Orders:
                                </span>
                                <span className="text-xs font-medium">
                                  {city.count}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">
                                  Zip Codes:
                                </span>
                                <span className="text-xs font-medium">
                                  {city.zipCodes.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                )}
              </MapContainer>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-3 shadow-lg z-[1000]">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Order Volume
              </h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">50+ orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">20-49 orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">10-19 orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">&lt;10 orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Statistics Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            State-wise Distribution
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {demographicsData.stateStats.map((state) => (
                  <tr key={state.state} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {state.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {state.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {state.cities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {(
                        (state.count / demographicsData.totalOrders) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
