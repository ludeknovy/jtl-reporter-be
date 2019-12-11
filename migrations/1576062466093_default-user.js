const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.up = async (pgm) => {
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync('2Txnf5prDknTFYTVEXjj', salt);

  try {

    await pgm.db.query({
      text: `
      INSERT INTO jtl.users(username, password) VALUES($1, $2)
      `,
      values: ['admin', hash]
    });
  } catch (error) {
    console.log(error)
  }
}