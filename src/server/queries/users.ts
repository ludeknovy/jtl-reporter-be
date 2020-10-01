export const getUsers = () => {
  return {
    // eslint-disable-next-line max-len
    text: `SELECT username, users.id, users.create_date as "createDate", COUNT(token.id) as "tokenCount" FROM jtl.users as users
    LEFT JOIN jtl.api_tokens as token on users.id = token.created_by
    GROUP BY username, users.id;`
  };
};


export const deleteUser = (userId) => {
  return {
    text: `DELETE FROM jtl.users users
    WHERE users.id = $1;`,
    values: [userId]
  };
};

export const isExistingUser = (userId) => {
  return {
    text: 'SELECT EXISTS(SELECT * FROM jtl.users users WHERE users.id = $1)',
    values: [userId]
  };
};
