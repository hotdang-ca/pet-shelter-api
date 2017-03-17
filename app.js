const express     = require('express');
const bodyParser  = require('body-parser');
const sqlite3     = require('sqlite3').verbose();

const app = express();

app.use(bodyParser.json());
// app.use((req, res, next) => {
//   // express needs a little nudge.. i guess...
//   console.log('middleware is draining...');
//   next();
// });

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.post('/pets', (req, res, next) => {
  const db = dbInstance();
  const { name, type, breed, location, latitude, longitude } = req.body;

  let duplicateCaught = false;
  // IS THERE ALREADY A RECORD?
  // TODO: actually refactor to get OUT OF HERE when there is another record of same
  const selectStatement = 'SELECT * FROM pets WHERE name = ? AND latitude = ? AND longitude = ? LIMIT 1';
  const selectParams = [ name, latitude, longitude];
  const selectCallback = ( (err, row) => {
    if (row) {
      db.close();
      console.log("Sending 409 Already Exists");
      res.status(409).send("already exists");
      // and, somehow get OUT of here...
      duplicateCaught = true;
    }
  });
  db.serialize(() => {
    db.get(selectStatement, selectParams, selectCallback);
    if (duplicateCaught) {
      return next(409);
    }
  });

  // TODO: input validation

  const statement = 'INSERT INTO pets ( name, type, breed, location, latitude, longitude ) VALUES ( $name, $type, $breed, $location, $latitude, $longitude );';
  const params = {
    $name: name,
    $type: type,
    $breed: breed,
    $location: location,
    $latitude: latitude,
    $longitude: longitude
  };
  const callback = ((error) => {
    if (error) {
      console.log(error);
      db.close();
      res.status(503).send('error');
      res.end();
    }

    // what, still here? Let's give you some data
    console.log('Record inserted.');
    const innerSelectStatement = 'SELECT * FROM pets WHERE name = ? AND latitude = ? AND longitude = ? LIMIT 1';
    const innerSelectParams = [ name, latitude, longitude];
    const innerSelectCallback = ( (err, row) => {
      console.log(err);
      db.close();
      res.send(row || err );
      res.end();
    });

    db.get(selectStatement, selectParams, selectCallback);
  });

  db.serialize( () => {
    db.run(statement, params, callback);
  });
});

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

app.listen(3000, () => {
  initDb();
  console.log('Example app listening on port 3000');
});
