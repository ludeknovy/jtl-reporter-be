export const getUsers = () => {
  return {
    text: 'SELECT username, id, create_date as "createDate" FROM jtl.users',
  };
};
