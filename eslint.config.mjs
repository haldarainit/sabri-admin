import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores (applies to all following configs)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Allow quote characters in JSX text without needing HTML entities
      "react/no-unescaped-entities": "off",
      // Prefer <Image>, but do not fail builds for <img>
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
