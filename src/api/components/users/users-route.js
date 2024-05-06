const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  route.patch(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changeUserPassword),
    usersControllers.changePassword
  );
};
