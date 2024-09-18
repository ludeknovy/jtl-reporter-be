
exports.up = async pgm => {
    await pgm.db.query({
        text: `INSERT INTO jtl.global DEFAULT VALUES;`,
        values: [],
    })
}
