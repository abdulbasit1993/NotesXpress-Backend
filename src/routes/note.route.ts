import express, { Router } from 'express';
const notesController = require('../controllers/notes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/add', verifyToken, notesController.createNote);

router.get('/getAll', verifyToken, notesController.getAllUserNotes);

router.get('/get/:id', verifyToken, notesController.getSingleNote);

router.put('/update/:id', verifyToken, notesController.updateNote);

router.delete('/delete/:id', verifyToken, notesController.deleteNote);

module.exports = router;
