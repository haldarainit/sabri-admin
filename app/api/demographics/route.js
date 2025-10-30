import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";

// City coordinates mapping for India (add more cities as needed)
const cityCoordinates = {
  // Major cities
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Visakhapatnam: { lat: 17.6869, lng: 83.2185 },
  Pimpri: { lat: 18.6298, lng: 73.7997 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Ludhiana: { lat: 30.901, lng: 75.8573 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Srinagar: { lat: 34.0837, lng: 74.7973 },
  Amritsar: { lat: 31.634, lng: 74.8723 },
  Allahabad: { lat: 25.4358, lng: 81.8463 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Howrah: { lat: 22.5958, lng: 88.2636 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Jabalpur: { lat: 23.1815, lng: 79.9864 },
  Gwalior: { lat: 26.2183, lng: 78.1828 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Kota: { lat: 25.2138, lng: 75.8648 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Solapur: { lat: 17.6599, lng: 75.9064 },
  Hubballi: { lat: 15.3647, lng: 75.124 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Bareilly: { lat: 28.367, lng: 79.4304 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Tiruppur: { lat: 11.1075, lng: 77.3398 },
  Gurgaon: { lat: 28.4595, lng: 77.0266 },
  Aligarh: { lat: 27.8974, lng: 78.088 },
  Jalandhar: { lat: 31.326, lng: 75.5762 },
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Mira: { lat: 19.2952, lng: 72.8579 },
  Guntur: { lat: 16.3067, lng: 80.4365 },
  Bhiwandi: { lat: 19.3009, lng: 73.0643 },
  Saharanpur: { lat: 29.968, lng: 77.546 },
  Gorakhpur: { lat: 26.7606, lng: 83.3732 },
  Bikaner: { lat: 28.0229, lng: 73.3119 },
  Amravati: { lat: 20.9374, lng: 77.7796 },
  Noida: { lat: 28.5355, lng: 77.391 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  Bhilai: { lat: 21.2093, lng: 81.3805 },
  Cuttack: { lat: 20.5136, lng: 85.883 },
  Firozabad: { lat: 27.1591, lng: 78.3957 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Bhavnagar: { lat: 21.7645, lng: 72.1519 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Durgapur: { lat: 23.5204, lng: 87.3119 },
  Asansol: { lat: 23.6739, lng: 86.9524 },
  Nanded: { lat: 19.1383, lng: 77.321 },
  Kolhapur: { lat: 16.705, lng: 74.2433 },
  Ajmer: { lat: 26.4499, lng: 74.6399 },
  Gulbarga: { lat: 17.3297, lng: 76.8343 },
  Jamnagar: { lat: 22.4707, lng: 70.0577 },
  Ujjain: { lat: 23.1765, lng: 75.7885 },
  Loni: { lat: 28.7521, lng: 77.2887 },
  Siliguri: { lat: 26.7271, lng: 88.3953 },
  Jhansi: { lat: 25.4484, lng: 78.5685 },
  Ulhasnagar: { lat: 19.2183, lng: 73.1382 },
  Nellore: { lat: 14.4426, lng: 79.9865 },
  Jammu: { lat: 32.7266, lng: 74.857 },
  Belgaum: { lat: 15.8497, lng: 74.4977 },
  Mangalore: { lat: 12.9141, lng: 74.856 },
  Ambattur: { lat: 13.1143, lng: 80.1548 },
  Tirunelveli: { lat: 8.7139, lng: 77.7567 },
  Malegaon: { lat: 20.5579, lng: 74.5287 },
  Gaya: { lat: 24.7955, lng: 84.9994 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Maheshtala: { lat: 22.5097, lng: 88.2482 },
  Davanagere: { lat: 14.4644, lng: 75.9217 },
  Kozhikode: { lat: 11.2588, lng: 75.7804 },
  Akola: { lat: 20.7002, lng: 77.0082 },
  Kurnool: { lat: 15.8281, lng: 78.0373 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Rajahmundry: { lat: 17.0005, lng: 81.804 },
  Ballari: { lat: 15.1394, lng: 76.9214 },
  Agartala: { lat: 23.8315, lng: 91.2868 },
  Bhagalpur: { lat: 25.2425, lng: 86.9842 },
  Latur: { lat: 18.3997, lng: 76.5604 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Rohtak: { lat: 28.8955, lng: 76.6066 },
  Korba: { lat: 22.3595, lng: 82.7501 },
  Bhilwara: { lat: 25.3407, lng: 74.6269 },
  Brahmapur: { lat: 19.315, lng: 84.7941 },
  Muzaffarpur: { lat: 26.1225, lng: 85.3906 },
  Ahmednagar: { lat: 19.0948, lng: 74.748 },
};

// State capital/centroid fallback coordinates (for unmapped cities)
const stateCoordinates = {
  "andhra pradesh": { lat: 16.5062, lng: 80.648 }, // Vijayawada/Amaravati region
  "arunachal pradesh": { lat: 27.0844, lng: 93.6053 }, // Itanagar
  assam: { lat: 26.1445, lng: 91.7362 }, // Guwahati
  bihar: { lat: 25.5941, lng: 85.1376 }, // Patna
  chhattisgarh: { lat: 21.2514, lng: 81.6296 }, // Raipur
  goa: { lat: 15.4909, lng: 73.8278 }, // Panaji
  gujarat: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad/Gandhinagar region
  haryana: { lat: 28.4595, lng: 77.0266 }, // Gurgaon/Chandigarh region
  "himachal pradesh": { lat: 31.1048, lng: 77.1734 }, // Shimla
  jharkhand: { lat: 23.3441, lng: 85.3096 }, // Ranchi
  karnataka: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
  kerala: { lat: 8.5241, lng: 76.9366 }, // Thiruvananthapuram
  "madhya pradesh": { lat: 23.2599, lng: 77.4126 }, // Bhopal
  maharashtra: { lat: 18.5204, lng: 73.8567 }, // Pune/Mumbai region
  manipur: { lat: 24.817, lng: 93.9368 }, // Imphal
  meghalaya: { lat: 25.5788, lng: 91.8933 }, // Shillong
  mizoram: { lat: 23.7271, lng: 92.7176 }, // Aizawl
  nagaland: { lat: 25.6672, lng: 94.1086 }, // Kohima
  odisha: { lat: 20.2961, lng: 85.8245 }, // Bhubaneswar
  punjab: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
  rajasthan: { lat: 26.9124, lng: 75.7873 }, // Jaipur
  sikkim: { lat: 27.3314, lng: 88.6138 }, // Gangtok
  "tamil nadu": { lat: 13.0827, lng: 80.2707 }, // Chennai
  telangana: { lat: 17.385, lng: 78.4867 }, // Hyderabad
  tripura: { lat: 23.8315, lng: 91.2868 }, // Agartala
  "uttar pradesh": { lat: 26.8467, lng: 80.9462 }, // Lucknow
  uttarakhand: { lat: 30.3165, lng: 78.0322 }, // Dehradun
  "west bengal": { lat: 22.5726, lng: 88.3639 }, // Kolkata
  delhi: { lat: 28.7041, lng: 77.1025 },
  "jammu and kashmir": { lat: 34.0837, lng: 74.7973 }, // Srinagar/Jammu region
  ladakh: { lat: 34.1526, lng: 77.577 }, // Leh
  "andaman and nicobar islands": { lat: 11.6234, lng: 92.7265 }, // Port Blair
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  dadra: { lat: 20.2763, lng: 73.0169 }, // Dadra & Nagar Haveli
  daman: { lat: 20.3974, lng: 72.8328 }, // Daman & Diu
  lakshadweep: { lat: 10.5667, lng: 72.6417 },
  puducherry: { lat: 11.9416, lng: 79.8083 },
  "daman and diu": { lat: 20.3974, lng: 72.8328 },
  "dadra and nagar haveli": { lat: 20.2763, lng: 73.0169 },
};

// Build lower-cased lookup tables for flexible matching
const cityCoordsLC = Object.fromEntries(
  Object.entries(cityCoordinates).map(([k, v]) => [k.toLowerCase(), v])
);
const stateCoordsLC = stateCoordinates;

// Common alternate names to improve hit rate
const citySynonymsLC = {
  bengaluru: "bangalore",
  bengalooru: "bangalore",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
  mangaluru: "mangalore",
  mysuru: "mysore",
  gurugram: "gurgaon",
  "pimpri-chinchwad": "pimpri",
  trivandrum: "thiruvananthapuram",
  prayagraj: "allahabad",
};

const stateSynonymsLC = {
  up: "uttar pradesh",
  mp: "madhya pradesh",
  uk: "uttarakhand",
  tn: "tamil nadu",
  wb: "west bengal",
  odisha: "odisha",
  orissa: "odisha",
  dl: "delhi",
  karnatak: "karnataka",
  mh: "maharashtra",
  gj: "gujarat",
};

function normalize(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function resolveCityCoords(cityLC) {
  if (!cityLC) return null;
  const canon = citySynonymsLC[cityLC] || cityLC;
  return cityCoordsLC[canon] || null;
}

function resolveStateCoords(stateLC) {
  if (!stateLC) return null;
  const canon = stateSynonymsLC[stateLC] || stateLC;
  return stateCoordsLC[canon] || null;
}

export async function GET() {
  try {
    await connectDB();

    // Fetch all orders with shipping addresses
    const orders = await Order.find({}, "shippingAddress").lean();

    // Process demographics data
    const cityMap = new Map();
    const stateMap = new Map();

    orders.forEach((order) => {
      if (order.shippingAddress) {
        const rawCity = order.shippingAddress.city || "";
        const rawState = order.shippingAddress.state || "";
        const zipCode =
          order.shippingAddress.zipCode ||
          order.shippingAddress.pincode ||
          order.shippingAddress.pinCode ||
          order.shippingAddress.postalCode;

        const cityLC = normalize(rawCity);
        const stateLC = normalize(rawState);

        // Resolve coordinates: city first, then state centroid fallback
        const cityCoords = resolveCityCoords(cityLC);
        const stateCoords = resolveStateCoords(stateLC);

        // Skip only if neither city nor state present
        if (!cityLC && !stateLC) return;

        const displayCity =
          rawCity && rawCity.trim() ? rawCity.trim() : "Unknown";
        const displayState =
          rawState && rawState.trim() ? rawState.trim() : "Unknown";

        const coords = cityCoords || stateCoords || null;

        // City statistics (by city+state combo)
        const cityKey = `${displayCity}-${displayState}`;
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, {
            city: displayCity,
            state: displayState,
            count: 0,
            zipCodes: new Set(),
            coordinates: coords,
          });
        }
        const cityData = cityMap.get(cityKey);
        cityData.count++;
        if (zipCode) cityData.zipCodes.add(String(zipCode));

        // State statistics
        if (!stateMap.has(displayState)) {
          stateMap.set(displayState, {
            state: displayState,
            count: 0,
            cities: new Set(),
          });
        }
        const stateData = stateMap.get(displayState);
        stateData.count++;
        stateData.cities.add(displayCity);
      }
    });

    // Convert maps to arrays and sort
    const cityStats = Array.from(cityMap.values())
      .map((city) => ({
        ...city,
        zipCodes: Array.from(city.zipCodes),
      }))
      .sort((a, b) => b.count - a.count);

    const stateStats = Array.from(stateMap.values())
      .map((state) => ({
        ...state,
        cities: state.cities.size,
      }))
      .sort((a, b) => b.count - a.count);

    const topCities = cityStats.slice(0, 10);

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      uniqueLocations: cityStats.length,
      cityStats,
      stateStats,
      topCities,
    });
  } catch (error) {
    console.error("Error fetching demographics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch demographics data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
