exports.up = async (pgm) => {
  try {
    const ids = await pgm.db.select({
      text: `
        SELECT id
        FROM jtl.items
        WHERE start_time is null;
        `,
    });
    ids.map(async ({ id }) => {
      const [data] = await pgm.db.select({
        text: `
        SELECT overview->'startDate' as start_date
        FROM jtl.item_stat
        WHERE item_id = $1`,
        values: [id]
      })
      console.log(data)
      await pgm.db.query({
        text: `UPDATE jtl.items SET start_time = $2 WHERE id = $1`,
        values: [id, data.start_date]
      })
    });
  } catch (error) {
    console.log(error)
  }
}