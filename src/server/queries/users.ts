export const getUsers = () => {
  return {
    text: `SELECT username, users.id, users.create_date as "createDate", COUNT(token.id) as "tokenCount" FROM jtl.users as users
    LEFT JOIN jtl.api_tokens as token on users.id = token.created_by
    GROUP BY username, users.id;`,
  };
};
