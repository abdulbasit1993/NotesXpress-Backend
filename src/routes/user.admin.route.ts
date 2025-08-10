import express, { Router } from 'express';
const usersController = require('../controllers/users.admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/getAll', verifyToken, isAdmin, usersController.getAllUsers);

router.get('/get/:id', verifyToken, isAdmin, usersController.getSingleUser);

router.put('/update/:id', verifyToken, isAdmin, usersController.updateUser);

router.delete('/delete/:id', verifyToken, isAdmin, usersController.deleteUser);

module.exports = router;
