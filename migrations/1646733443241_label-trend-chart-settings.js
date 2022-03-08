exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        label_trend_chart_settings: {
            type: "jsonb",
            "default": JSON.stringify({
                virtualUsers: true,
                throughput: false,
                avgConnectionTime: false,
                avgLatency: false,
                avgResponseTime: false,
                p90: true,
                p95: true,
                p99: true,
                errorRate: true,
            }),
            notNull: true,
        },
    })
}
