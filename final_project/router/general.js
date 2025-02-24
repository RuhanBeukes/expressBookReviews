const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
        res.send(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    let author = req.params.author;
    let filteredBooks = {};
    Object.keys(books).forEach((key) => {
        if (books[key].author === author) {
            filteredBooks[key] = books[key];
        }
    });
    if (Object.keys(filteredBooks).length > 0) {
        res.send(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found for the given author" });
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let title = req.params.title;
    let filteredBooks = {};
    Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
            filteredBooks[key] = books[key];
        }
    });
    if (Object.keys(filteredBooks).length > 0) {
        res.send(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found for the given title" });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

/* --- Async Endpoints Using Axios (Tasks 10-13) --- */

// Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/async/books', async (req, res) => {
    try {
        let response = await axios.get('http://localhost:5000/');
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        let isbn = req.params.isbn;
        let response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book details", error: error.message });
    }
});

// Task 12: Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
    try {
        let author = req.params.author;
        let response = await axios.get(`http://localhost:5000/author/${author}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by author", error: error.message });
    }
});

// Task 13: Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async (req, res) => {
    try {
        let title = req.params.title;
        let response = await axios.get(`http://localhost:5000/title/${title}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by title", error: error.message });
    }
});

module.exports.general = public_users;
