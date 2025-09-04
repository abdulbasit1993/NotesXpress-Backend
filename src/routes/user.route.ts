import express, { Router } from 'express';
const usersController = require('../controllers/notes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/user-stats', verifyToken, usersController.getUserStats);

module.exports = router;
