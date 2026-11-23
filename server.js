const express = require("express");

const app = express();
const PORT = 3000;

// Read JSON request bodies
app.use(express.json());

// In-memory storage (data resets when the server restarts)
let books = [];
let nextId = 1;

// Helper: find a book by its ID
function findBookIndex(id) {
  return books.findIndex((book) => book.id === Number(id));
}

// 1. POST /api/books - Add a new book
app.post("/api/books", (req, res) => {
  const { title, author, year } = req.body;

  // Check required fields
  if (
    typeof title !== "string" || title.trim() === "" ||
    typeof author !== "string" || author.trim() === "" ||
    year === undefined || year === null || year === "" ||
    !Number.isFinite(Number(year))
  ) {
    return res.status(400).json({
      message: "Missing or invalid data. title, author and numeric year are required."
    });
  }

  // A book with the same title is not allowed
  const duplicateBook = books.some(
    (book) => book.title.toLowerCase() === title.trim().toLowerCase()
  );

  if (duplicateBook) {
    return res.status(409).json({
      message: "A book with this title already exists."
    });
  }

  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year: Number(year)
  };

  books.push(newBook);

  return res.status(201).json({
    message: "Book added successfully.",
    book: newBook
  });
});

// 2. GET /api/books - Get all books, with optional author filter
app.get("/api/books", (req, res) => {
  const { author } = req.query;

  let result = books;

  if (author !== undefined) {
    result = books.filter(
      (book) => book.author.toLowerCase() === author.trim().toLowerCase()
    );
  }

  return res.status(200).json({
    count: result.length,
    books: result
  });
});

// 3. GET /api/books/:id - Get one book by ID
app.get("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookIndex = findBookIndex(id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.status(200).json({ book: books[bookIndex] });
});

// 4. PUT /api/books/:id - Update a book
app.put("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookIndex = findBookIndex(id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found." });
  }

  const { title, author, year } = req.body;

  if (
    typeof title !== "string" || title.trim() === "" ||
    typeof author !== "string" || author.trim() === "" ||
    year === undefined || year === null || year === "" ||
    !Number.isFinite(Number(year))
  ) {
    return res.status(400).json({
      message: "Missing or invalid data. title, author and numeric year are required."
    });
  }

  const duplicateBook = books.some(
    (book, index) =>
      index !== bookIndex &&
      book.title.toLowerCase() === title.trim().toLowerCase()
  );

  if (duplicateBook) {
    return res.status(409).json({
      message: "A book with this title already exists."
    });
  }

  books[bookIndex] = {
    id,
    title: title.trim(),
    author: author.trim(),
    year: Number(year)
  };

  return res.status(200).json({
    message: "Book updated successfully.",
    book: books[bookIndex]
  });
});

// 5. DELETE /api/books/:id - Delete a book
app.delete("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookIndex = findBookIndex(id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found." });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];

  return res.status(200).json({
    message: "Book deleted successfully.",
    book: deletedBook
  });
});

// Handle invalid JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body." });
  }
  return next(err);
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Books API is running at http://localhost:${PORT}`);
});
