const express = require('express');
const router = express.Router();

const createUser = require('../controllers/users/createUser');
const getAllUsers = require('../controllers/users/getAllUsers');
const getUserById = require('../controllers/users/getUserById');
const updateUser = require('../controllers/users/updateUser');
const deleteUser = require('../controllers/users/deleteUser');

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
