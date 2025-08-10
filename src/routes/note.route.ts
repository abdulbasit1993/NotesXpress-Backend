import express, { Router } from 'express';
const notesController = require('../controllers/notes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/add', verifyToken, notesController.createNote);

module.exports = router;
