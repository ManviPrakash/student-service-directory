// server.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

// allows reading json body from post
app.use(express.json());

// will help to open html in browser from the same server for ui
app.use(express.static(path.join(__dirname, "public")));

/**
 * helper function to validate http / https urls
 * url is optional, but if provided must be valid
 */
function isValidHttpUrl(value) {
  if (!value) return true; // optional
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Health check (quick test)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/services or GET /api/services?category=wellness
// returns services from DB and filter the results
app.get("/api/services", (req, res) => {
  const category = (req.query.category || "").trim();

  let sql = "SELECT * FROM services ORDER BY id DESC";
  let params = [];

  if (category) {
    sql =
      "SELECT * FROM services WHERE LOWER(category)=LOWER(?) ORDER BY id DESC";
    params.push(category);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// POST /api/services
// inserts new row and will return 201 created
app.post("/api/services", (req, res) => {
  const { title, category, description, url } = req.body;

  // basic required field validation
  if (!title || !category) {
    return res.status(400).json({ error: "title and category are required" });
  }

  // url validation (if provided)
  if (url && !isValidHttpUrl(url.trim())) {
    return res.status(400).json({ error: "url must be a valid http(s) link" });
  }

  const stmt = db.prepare(`
    INSERT INTO services (title, category, description, url)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    title.trim(),
    category.trim(),
    description || "",
    url ? url.trim() : ""
  );

  const created = db
    .prepare("SELECT * FROM services WHERE id=?")
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

// PUT /api/services/:id
// updates an existing service
app.put("/api/services/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, category, description, url } = req.body;

  // validate id
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  // required fields validation
  if (!title || !category) {
    return res.status(400).json({ error: "title and category are required" });
  }

  // url validation (if provided)
  if (url && !isValidHttpUrl(url.trim())) {
    return res.status(400).json({ error: "url must be a valid http(s) link" });
  }

  // check if service exists
  const existing = db.prepare("SELECT * FROM services WHERE id=?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  db.prepare(`
    UPDATE services
    SET title=?, category=?, description=?, url=?
    WHERE id=?
  `).run(
    title.trim(),
    category.trim(),
    description || "",
    url ? url.trim() : "",
    id
  );

  const updated = db
    .prepare("SELECT * FROM services WHERE id=?")
    .get(id);

  res.json(updated);
});

// DELETE /api/services/:id
// deletes a service
app.delete("/api/services/:id", (req, res) => {
  const id = Number(req.params.id);

  // validate id
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  // check if service exists
  const existing = db.prepare("SELECT * FROM services WHERE id=?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  db.prepare("DELETE FROM services WHERE id=?").run(id);
  res.status(204).send();
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
