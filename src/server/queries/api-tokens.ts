export const createNewApiToken = (token, description, createdBy) => {
  return {
    text: 'INSERT INTO jtl.api_tokens(token, description, created_by) VALUES($1, $2, $3)',
    values: [token, description, createdBy]
  };
};

export const getApiTokens = {
  // eslint-disable-next-line max-len
  text: `SELECT tokens.id, description, token, tokens.create_date as "createDate", users.username as "createdBy" FROM jtl.api_tokens tokens
  LEFT JOIN jtl.users users on users.id = tokens.created_by;`
};

export const deleteToken = (id) => {
  return {
    text: 'DELETE FROM jtl.api_tokens WHERE id = $1;',
    values: [id]
  };
};

export const getApiToken = (token) => {
  return {
    text: 'SELECT * FROM jtl.api_tokens WHERE token = $1;',
    values: [token]
  };
};
