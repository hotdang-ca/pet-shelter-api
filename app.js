const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const initDb = (() => {
  const db = new sqlite3.Database('./db/pets.sqlite3');

  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS pets(id INTEGER PRIMARY KEY, name TEXT, type TEXT, breed TEXT, location TEXT, latitude DOUBLE, longitude DOUBLE)');
  });
  console.log('db initialized');
  db.close();
});

initDb();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
