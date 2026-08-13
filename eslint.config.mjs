import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // AppleDouble shadow files (this project lives on an exFAT volume).
    "**/._*",
    // Google Apps Script source - runs in Google's runtime, not this app.
    "scripts/**",
  ]),
]);

export default eslintConfig;
