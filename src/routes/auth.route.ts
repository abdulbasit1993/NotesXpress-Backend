import express, { Router } from 'express';
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/profile', verifyToken, authController.getUserProfile);

module.exports = router;
