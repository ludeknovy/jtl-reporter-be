exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "user_scenario_settings" }, {
        scenario_trends_settings: {
            type: "jsonb",
            "default": JSON.stringify({ aggregatedTrends: true }),
            notNull: true,
        },
    })
}
