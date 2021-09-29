
export const getUser = (username) => {
  return {
    text: 'SELECT * FROM jtl.users WHERE username = $1',
    values: [username]
  };
};

export const getUserById = (id) => {
  return {
    text: 'SELECT * FROM jtl.users WHERE id = $1',
    values: [id]
  };
};

export const getUsers = () => {
  return {
    text: 'SELECT * FROM jtl.users'
  };
};

export const createUser = (username, password) => {
  return {
    text: 'INSERT INTO jtl.users(username, password) VALUES($1, $2)',
    values: [username, password]
  };
};

export const updatePassword = (id, password) => {
  return {
    text: 'UPDATE jtl.users SET password = $2 WHERE id = $1;',
    values: [id, password]
  };
};
