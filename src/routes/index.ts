import express, { Router } from 'express';
const authRouter = require('./auth.route');

const router = Router();

router.use('/auth', authRouter);

module.exports = router;
