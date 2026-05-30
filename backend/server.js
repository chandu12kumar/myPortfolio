require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQL Connected");
  }
});

app.post("/api/contact", (req, res) => {
  const { Name, email, phone, City, message } = req.body;

  const sql =
    "INSERT INTO contacts(name,email,phone,city,message) VALUES (?,?,?,?,?)";

  db.query(sql, [Name, email, phone, City, message], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        msg: "Database Error",
      });
    }

    res.json({
      success: true,
      msg: "Message Saved",
    });
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
