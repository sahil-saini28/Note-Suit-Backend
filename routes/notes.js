const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// Fetch all notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});

// Add a new note
router.post('/addnotes', fetchuser, [
  body('title', 'Enter a valid title').isLength({ min: 1 }),
  body('description', 'Enter a valid description').isLength({ min: 1 }),
], async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notes = new Notes({
      title,
      description,
      tag,
      user: req.user.id
    });

    const savedNotes = await notes.save();
    res.json(savedNotes);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});

// Update a note
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;

  // Create a newNote object with the updated fields
  const newNote = {};
  if (title) newNote.title = title;
  if (description) newNote.description = description;
  if (tag) newNote.tag = tag;

  try {
    let notes = await Notes.findById(req.params.id);

    if (!notes) {
      return res.status(404).send("Not Found");
    }

    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // Use findOneAndUpdate() with proper parameters to update the note
    notes = await Notes.findOneAndUpdate(
      { _id: req.params.id }, // Specify the conditions to find the note by its ID
      { $set: newNote }, // Set the updated fields using $set
      { new: true } // Set { new: true } to return the updated note
    );

    res.json({ notes });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});

// _________________________________________________________________________________________________________________

router.delete('/delete/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  const newNote = {};

  if (title) newNote.title = title;
  if (description) newNote.description = description;
  if (tag) newNote.tag = tag;

  try {
    let notes = await Notes.findById(req.params.id);

    if (!notes) {
      return res.status(404).send("Not Found");
    }

    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    notes = await Notes.findOneAndDelete(req.params.id, { $set: newNote }, { new: true });
    res.json({ "success":"note hass been deleted" });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});

module.exports = router;
