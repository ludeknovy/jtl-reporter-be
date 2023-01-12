exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        apdex_settings: {
            type: "jsonb",
            "default": JSON.stringify({ enabled: false, toleratingThreshold: 400, satisfyingThreshold: 100 }),
            notNull: false,
        },
    })
}
