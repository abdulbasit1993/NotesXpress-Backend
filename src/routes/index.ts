import express, { Router } from 'express';
const authRouter = require('./auth.route');
const usersRouter = require('./user.admin.route');

const router = Router();

router.use('/auth', authRouter);

router.use('/admin/users', usersRouter);

module.exports = router;
