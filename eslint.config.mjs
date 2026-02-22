import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      // Keep linting strict but not noisy during migration.
      "@next/next/no-img-element": "off"
    }
  }
];

