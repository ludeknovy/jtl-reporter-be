const path = require("path")
const fs = require("fs")
const js = require("@eslint/js")
const { FlatCompat } = require("@eslint/eslintrc")

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
})

const legacyConfigs = compat.config(JSON.parse(fs.readFileSync(path.join(__dirname, ".eslintrc"), "utf8")))

module.exports = [
    {
        ignores: ["coverage/**", "dist/**", "node_modules/**"],
    },
    ...legacyConfigs.map(config => config.files ? config : {
        ...config,
        files: ["**/*.ts"],
    }),
]
