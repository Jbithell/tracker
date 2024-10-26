import prettier from "prettier";
import remixEslintConfig from "@remix-run/eslint-config";
import drizzle from "eslint-plugin-drizzle";
export default [
  drizzle.configs["recommended"]
  {
    plugins: {
      prettier,
      "remix-run": remixEslintConfig,
      drizzle,
    },
    files: ["app/**/*.ts", "app/**/*.tsx"],
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
  },
];
