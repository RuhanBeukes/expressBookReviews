const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (i.e. not already taken)
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// Check if username and password match our records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    let accessToken = jwt.sign({ username: username }, "fingerprint_customer", { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in", accessToken: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.query.review;
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }
    let username = req.session.authorization && req.session.authorization.username;
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    // Add or update the review under the user's name
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// Delete a book review (only the review of the logged in user)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.session.authorization && req.session.authorization.username;
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "Review not found for the user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
