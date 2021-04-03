exports.up = async (pgm) => {
  try {
    const ids = await pgm.db.select({
      text: `
          SELECT id
          FROM jtl.items
          WHERE report_status = $1;
          `,
      values: ['ready']
    });
    ids.map(async ({ id }) => {
      const data = await pgm.db.select({
        text: `
          SELECT overview
          FROM jtl.item_stat
          WHERE item_id = $1`,
        values: [id]
      });
      await pgm.db.query({
        text: 'UPDATE jtl.item_stat SET overview = $2 WHERE item_id = $1',
        values: [id, fixOverview(data[0].overview)]
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const fixOverview = (data) => {
  if (data.avgLatency) {
    data.avgLatency = parseFloat(data.avgLatency, 10);
  }
  return JSON.stringify(data);
};
