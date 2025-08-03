import express, { Router } from 'express';
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/signup', authController.signup);

module.exports = router;
