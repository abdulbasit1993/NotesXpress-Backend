import express, { Router } from 'express';
const authRouter = require('./auth.route');
const usersRouter = require('./user.admin.route');
const notesRouter = require('./note.route');

const router = Router();

router.use('/auth', authRouter);

router.use('/admin/users', usersRouter);

router.use('/notes', notesRouter);

module.exports = router;
