import express, { Router } from 'express';
const authRouter = require('./auth.route');
const userAdminRouter = require('./user.admin.route');
const notesRouter = require('./note.route');
const usersRouter = require('./user.route');

const router = Router();

router.use('/auth', authRouter);

router.use('/admin/users', userAdminRouter);

router.use('/notes', notesRouter);

router.use('/users', usersRouter);

module.exports = router;
