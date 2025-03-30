const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error("Database connection error:", err);
  else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
      )`
    );
  }
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new user, shoudln't allow duplicate emails
app.post("/users", (req, res) => {
    const { firstName, lastName, email } = req.body;
  
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.get(checkQuery, [email], (err, row) => {
      if (row) {
        return res.status(400).json({ error: "Email already exists." });
      }
  
      const insertQuery = "INSERT INTO users (firstName, lastName, email) VALUES (?, ?, ?)";
      db.run(insertQuery, [firstName, lastName, email], function (err) {
        if (err) {
          return res.status(500).json({ error: "Database error." });
        }
        res.json({ id: this.lastID, firstName, lastName, email });
      });
    });
  });

// Update a user
app.put("/users/:id", (req, res) => {
  const { firstName, lastName, email } = req.body;
  const { id } = req.params;

  db.run("UPDATE users SET firstName = ?, lastName = ?, email = ? WHERE id = ?", 
    [firstName, lastName, email, id], 
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User updated successfully" });
    }
  );
});

// Delete a user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));