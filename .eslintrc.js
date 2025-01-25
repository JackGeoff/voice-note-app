const { FlatCompat } = require("@eslint/eslintrc")
const path = require("path")

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  // You can add more custom rules or overrides here if needed
}


