exports.up = (pgm) => {
    pgm.createType("notification_type", ["report_detail", "degradation"] )
    pgm.addColumn({ schema: "jtl", name: "notifications" }, {
        notification_type: {
            type: "notification_type",
            "default": "report_detail",
            notNull: true,
        },
    })
}
