export const createNewApiToken = (token, description, createdBy) => {
  return {
    text: 'INSERT INTO jtl.api_tokens(token, description, created_by) VALUES($1, $2, $3)',
    values: [token, description, createdBy]
  }
}

export const getApiTokens = {
  text: `SELECT id, description, token, create_date as "createDate" FROM jtl.api_tokens;`
}

export const deleteToken = (id) => {
  return {
    text: `DELETE FROM jtl.api_tokens WHERE id = $1;`,
    values: [id]
  }
}

export const getApiToken = (token) => {
  return {
    text: 'SELECT * FROM jtl.api_tokens WHERE token = $1;',
    values: [token]
  }
}