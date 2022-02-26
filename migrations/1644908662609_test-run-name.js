exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "items" }, {
      name: {
        type: "VARCHAR(200)",
        "default": null,
      },
    })
  }

