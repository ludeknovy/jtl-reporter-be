exports.up = (pgm) => {
    pgm.alterColumn({ schema: "jtl", name: "samples" }, "timestamp", {
        type: "timestamp with time zone",
    })
}
