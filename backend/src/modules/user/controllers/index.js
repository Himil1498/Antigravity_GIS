const { getAllUsers, getUserById } = require('./readController');
const { createUser } = require('./createController');
const { updateUser } = require('./updateController');
const { deleteUser } = require('./deleteController');

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
