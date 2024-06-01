exports.up = (pgm) => {
    pgm.createExtension("timescaledb_toolkit")
}
