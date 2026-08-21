const express = require("express");
const path = require("path");

const { inputCleaner, inputValidator } = require("./middleware");

const app = express();
const PORT = 3000;

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Redirect / to /form
app.get("/", (req, res) => {
  res.redirect("/form");
});

// Serve the form
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Submit route with middleware
app.post(
  "/submit",
  inputCleaner,
  inputValidator,
  (req, res) => {
    res.send(`
      <h1>Submitted Data</h1>
      <p>Username: ${req.body.username}</p>
      <p>Comment: ${req.body.comment}</p>
    `);
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});