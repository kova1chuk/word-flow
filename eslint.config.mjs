import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      import: (await import("eslint-plugin-import")).default,
    },
    rules: {
      // Import sorting and organization rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-in modules
            "external", // Third-party modules
            "internal", // Internal modules (relative imports)
            "parent", // Parent directory imports
            "sibling", // Sibling directory imports
            "index", // Index imports
            "object", // Object imports
            "type", // Type imports
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            // React imports first
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            // Next.js imports in specific order
            {
              pattern: "next",
              group: "external",
              position: "after",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "after",
            },
            // Firebase imports
            {
              pattern: "firebase/**",
              group: "external",
              position: "after",
            },
            // Redux imports
            {
              pattern: "@reduxjs/toolkit",
              group: "external",
              position: "after",
            },
            {
              pattern: "react-redux",
              group: "external",
              position: "after",
            },
            // UI library imports
            {
              pattern: "@heroicons/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@radix-ui/**",
              group: "external",
              position: "after",
            },
            // Internal absolute imports (your project structure)
            {
              pattern: "@/app/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/features/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/entities/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/shared/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/types/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/providers/**",
              group: "internal",
              position: "after",
            },
            // Relative imports
            {
              pattern: "./**",
              group: "sibling",
              position: "after",
            },
            {
              pattern: "../**",
              group: "parent",
              position: "after",
            },
            // CSS and style imports last
            {
              pattern: "*.css",
              group: "type",
              position: "after",
            },
            {
              pattern: "*.scss",
              group: "type",
              position: "after",
            },
            {
              pattern: "*.sass",
              group: "type",
              position: "after",
            },
            {
              pattern: "*.less",
              group: "type",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
        },
      ],
      // Prevent duplicate imports
      "import/no-duplicates": "error",
      // Ensure imports are at the top of the file
      "import/first": "error",
      // Ensure newlines after import statements
      "import/newline-after-import": "error",
      // Prevent importing from the same module multiple times
      "import/no-useless-path-segments": "error",
      // Ensure consistent file extensions
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
      // Prevent importing default as named import
      "import/no-named-as-default": "warn",
      // Prevent importing default as default
      "import/no-named-as-default-member": "warn",
      // Ensure proper import/export syntax
      "import/no-mutable-exports": "error",
      // Prevent importing from index files when direct import is available
      "import/no-useless-path-segments": "error",
      // Additional formatting rules
      "import/no-absolute-path": "error",
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/no-unresolved": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];

export default eslintConfig;
