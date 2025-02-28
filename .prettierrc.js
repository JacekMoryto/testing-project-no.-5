module.exports = {
  tailwindConfig: "./tailwind.config.js",
  trailingComma: "es5",
  arrowParens: "avoid",
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  singleQuote: true, // Domyślnie używa pojedynczych cudzysłowów
  bracketSpacing: true,
  bracketSameLine: false,
  proseWrap: "always",
  endOfLine: "lf",
  overrides: [
    {
      files: "*.json",
      options: { singleQuote: false } // JSON wymaga podwójnych cudzysłowów
    },
    {
      files: ["*.ts", "*.tsx"],
      options: { singleQuote: true } // W TypeScript używamy pojedynczych cudzysłowów
    }
  ]
};