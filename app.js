const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const dbInstance = (() => {
  return new sqlite3.Database('./db/pets.sqlite3');
});

const initDb = (() => {
  const db = dbInstance();

  db.serialize( () => { // inline string
    db.run(
      'CREATE TABLE IF NOT EXISTS pets '
    + '('
    + 'id INTEGER PRIMARY KEY,'
    + 'name TEXT,'
    + 'type TEXT,'
    + 'breed TEXT,'
    + 'location TEXT,'
    + 'latitude DOUBLE,'
    + 'longitude DOUBLE'
    + ')'
    );
  });

  console.log('db initialized');
  db.close();
});

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.post('/pets', (req, res) => {
  const db = dbInstance();

  db.serialize( () => {
    // const insertPetStatement = db.prepare('INSERT INTO pets VALUES (?)');
      db.run(
        'INSERT INTO pets'
        + ' ( name, type, breed, location, latitude, longitude )'
        + ' VALUES ( $name, $type, $breed, $location, $latitude, $longitude );', {
          $name: "test",
          $type: "test",
          $breed: "test",
          $location: "test",
          $latitude: 123.456,
          $longitude: 654.321
        }, (error) => {
        console.log(`record was${ error ? ' not ' : ' '}inserted`);
      });
  });

  db.close();
  // return some sort of JSON...?

});

app.listen(3000, () => {
  initDb();
  console.log('Example app listening on port 3000');
});
