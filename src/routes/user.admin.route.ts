import express, { Router } from 'express';
const usersController = require('../controllers/users.admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/getAll', verifyToken, isAdmin, usersController.getAllUsers);

module.exports = router;
