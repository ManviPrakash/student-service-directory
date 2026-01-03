const db = require("./db");

// prepare is creating a sql statement once, then runs it fast multiple times.
// ? are placeholders so it can prevent sql injection
const insert = db.prepare(`
  INSERT INTO services (title, category, description, url)
  VALUES (?, ?, ?, ?)
`);

const data = [
  ["Academic Advising", "academic", "Course planning and program support", "https://www.georgebrown.ca/ask-george-brown/do-you-have-advising-services-1660689791502"],
  ["Writing Centre", "academic", "Help with writing and assignments", "https://www.georgebrown.ca/tutoring-and-learning-centre"],
  ["Scholarships & Bursaries", "financial", "Support for financial aid options", "https://www.georgebrown.ca/apply/financial-aid"],
  ["Counselling Services", "wellness", "Mental health support and counselling", "https://www.georgebrown.ca/current-students/services/counselling"]
];

// delete from services clear out old rows so the demo data is clean
db.prepare("DELETE FROM services").run();
for (const row of data) insert.run(...row);

console.log("Seed complete!");
