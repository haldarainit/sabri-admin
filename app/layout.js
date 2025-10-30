import { Outfit } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import GoogleAnalytics from "../components/GoogleAnalytics";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // optional weights
});

export const metadata = {
  title: "Sabri Admin Dashboard",
  description: "Sabri Jewelry Store Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased`}
        style={{ backgroundColor: "var(--shopify-bg-primary)" }}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
