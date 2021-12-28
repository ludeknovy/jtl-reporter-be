
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

export const createUser = (username, password, role) => {
  return {
    text: 'INSERT INTO jtl.users(username, password, role) VALUES($1, $2, $3)',
    values: [username, password, role]
  };
};

export const updatePassword = (id, password) => {
  return {
    text: 'UPDATE jtl.users SET password = $2 WHERE id = $1;',
    values: [id, password]
  };
};
