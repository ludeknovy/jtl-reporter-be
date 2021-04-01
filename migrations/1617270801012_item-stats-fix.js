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
        SELECT stats, overview
        FROM jtl.item_stat
        WHERE item_id = $1`,
        values: [id]
      });
      await pgm.db.query({
        text: 'UPDATE jtl.item_stat SET overview = $2, stats = $3 WHERE item_id = $1',
        values: [id, fixOverview(data[0].overview), fixStats(data[0].stats)]
      });
    });
  } catch (error) {
    console.log(error);
  }
};


const fixStats = (data) => {
  const fixedData = data.map((_) => {
    if (_.bytes) {
      _.bytes = parseInt(_.bytes, 10);
    }
    if (_.avgResponseTime) {
      _.avgResponseTime = parseInt(_.avgResponseTime, 10);
    }
    return _;
  });
  return JSON.stringify(fixedData);
};

const fixOverview = (data) => {
  if (data.avgResponseTime) {
    data.avgResponseTime = parseFloat(data.avgResponseTime, 10);
  }
  return JSON.stringify(data);
};
