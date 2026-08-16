import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat config; the FlatCompat bridge breaks on
// ESLint 10, and eslint-plugin-react is not ESLint 10 compatible yet — hence the
// eslint@^9 pin in package.json.
const config = [
  ...coreWebVitals,
  ...typescript,
  { ignores: ["out/**", ".next/**", "node_modules/**", "public/**", "scripts/**"] },
];

export default config;
