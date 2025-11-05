"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ important to send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Redirect to dashboard after successful login
        window.location.href = "/dashboard";
      } else if (res.status === 429) {
        // Handle rate limiting
        setError(
          "Too many login attempts. Please wait a few minutes before trying again."
        );
      } else {
        // ❌ Show backend error message
        setError(data.message || "Login failed");
      }
    } catch (err) {
      // 🔹 Network or unexpected errors
      console.error(err);
      if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 bg-[var(--shopify-bg-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className="rounded-xl p-8 shadow-lg"
            style={{
              backgroundColor: "var(--shopify-surface)",
              border: "1px solid var(--shopify-border)",
            }}
          >
            {/* Header */}
            <motion.div
              className="text-center space-y-3 mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-2"
                style={{ backgroundColor: "var(--shopify-action-primary)" }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4,
                }}
              >
                <ShoppingBag className="w-7 h-7 text-white" />
              </motion.div>
              <h1 style={{ color: "var(--shopify-text-primary)" }}>
                Welcome back
              </h1>
              <p style={{ color: "var(--shopify-text-secondary)" }}>
                Continue to Sabri Admin
              </p>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Label
                  htmlFor="email"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sabri.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      borderColor: "var(--shopify-border)",
                      color: "var(--shopify-text-primary)",
                    }}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Label
                  htmlFor="password"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      borderColor: "var(--shopify-border)",
                      color: "var(--shopify-text-primary)",
                    }}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--shopify-text-secondary)" }}
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember"
                    className="cursor-pointer select-none"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="transition-colors"
                  style={{ color: "var(--shopify-action-primary)" }}
                  onClick={() => console.log("Forgot password")}
                  disabled={isSubmitting}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      "var(--shopify-action-primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--shopify-action-primary)")
                  }
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full transition-all"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "var(--shopify-action-primary)",
                    color: "white",
                  }}
                  onMouseEnter={(e) =>
                    !isSubmitting &&
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-action-primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    !isSubmitting &&
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-action-primary)")
                  }
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Admin Dashboard Image */}
      <motion.div
        className="hidden lg:flex flex-1 relative"
        style={{ backgroundColor: "var(--shopify-action-primary)" }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1726365222176-425a1a1b9b98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG1pbiUyMGRhc2hib2FyZCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjIzMjc1MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Admin dashboard"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-center p-12">
          <motion.div
            className="max-w-lg text-white space-y-6 w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.h2
              className="text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Manage your store with confidence
            </motion.h2>
            <motion.p
              className="text-xl text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              Access powerful tools and insights to grow your business. Join
              thousands of merchants who trust Sabri Admin.
            </motion.p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="text-4xl mb-1">10k+</div>
                <div className="text-white/80">Active Stores</div>
              </motion.div>
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="text-4xl mb-1">4.9</div>
                <div className="text-white/80">Rating</div>
              </motion.div>
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="text-4xl mb-1">24/7</div>
                <div className="text-white/80">Support</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
