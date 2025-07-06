const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// 添加新书
router.post('/books', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).send('missing required field title');
    
    const newBook = new Book({ title });
    await newBook.save();
    res.json({ _id: newBook._id, title: newBook.title });
  } catch (err) {
    res.status(500).send('server error');
  }
});

// 获取所有书籍
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find({}, '_id title commentcount');
    res.json(books);
  } catch (err) {
    res.status(500).send('server error');
  }
});

// 添加评论
router.post('/books/:id', async (req, res) => {
  try {
    const { comment } = req.body;
    const { id } = req.params;
    
    if (!comment) return res.status(400).send('missing required field comment');
    
    const book = await Book.findByIdAndUpdate(
      id,
      { $push: { comments: comment }, $inc: { commentcount: 1 } },
      { new: true }
    );
    
    if (!book) return res.status(404).send('no book exists');
    res.json(book);
  } catch (err) {
    res.status(500).send('server error');
  }
});

// 删除书籍
router.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    
    if (!deletedBook) return res.status(404).send('no book exists');
    res.send('delete successful');
  } catch (err) {
    res.status(500).send('server error');
  }
});

// 删除所有书籍
router.delete('/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.send('complete delete successful');
  } catch (err) {
    res.status(500).send('server error');
  }
});

module.exports = router;