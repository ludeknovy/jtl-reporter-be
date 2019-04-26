exports.up = (pgm) => {
  pgm.db.select({
    text: `
      SELECT DISTINCT(test_name)
      FROM jtl.items;
    `
  }).then(result => {
    return Promise.all(result.map(_ => {
      return pgm.db.query({
        text: `
          INSERT INTO jtl.scenario (name)
          VALUES ($1)`,
        values: [_.test_name]
      }).then(res => res)
        .catch(e => console.log(e))
    })).catch(e => console.log(e))
  })
};

