const express     = require('express');
const bodyParser  = require('body-parser');
const sqlite3     = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello world!');
  // next();
});

app.get('/pets', (req, res, next) => {
  const db = dbInstance();
  const selectStatement = 'SELECT * FROM pets';
  const selectParams = [];
  const selectCallback = ((error, rows) => {
    if (!rows) {
      res.status(404).send({code: 404, error: 'Not found' });
    } else {
      res.send(rows);
    }
    next();
  });
  db.all(selectStatement, selectParams, selectCallback);
});

app.get('/pets/:id', (req, res, next) => {
  const { id } = req.params;
  const db = dbInstance(); // TODO: get this innerjoin working with the sql library
  const selectStatement = 'SELECT pets.type_id, pets.breed_id, types.name, breeds.name, pets.name, pets.location, pets.latitude, pets.longitude FROM pets JOIN breeds ON pets.breed_id = breeds.id JOIN types ON pets.type_id = types.id WHERE pets.id = ?';
  const selectParams = [ id ];
  const selectCallback = ((error, row) => {
    if (!row) {
      res.status(404).send({code: 404, error: 'Not found' });
    } else {
      res.send(row);
    }
    next();
  });

  db.get(selectStatement, selectParams, selectCallback);
});

app.post('/pets', (req, res, next) => {
  const db = dbInstance();
  const { name, type, breed, location, latitude, longitude } = req.body;

  // IS THERE ALREADY A RECORD?
  // TODO: actually refactor to get OUT OF HERE when there is another record of same
  const isADuplicatePromise = new Promise((resolve, reject) => {
    const selectStatement = 'SELECT * FROM pets WHERE name = ? AND latitude = ? AND longitude = ? LIMIT 1';
    const selectParams = [ name, latitude, longitude];
    const selectCallback = ( (err, row) => {
      if (row) {
        reject({code: 409, error: '409 Record Already Exists.'});
      } else {
        resolve();
      }
    });

    db.get(selectStatement, selectParams, selectCallback);
  });

  // TODO: input validation
  const statement = 'INSERT INTO pets ( name, type_id, breed_id, location, latitude, longitude ) VALUES ( $name, $typeId, $breedId, $location, $latitude, $longitude );';
  const params = {
    $name: name,
    $typeId: typeId,
    $breedId: breedId,
    $location: location,
    $latitude: latitude,
    $longitude: longitude
  };
  const callback = ((error) => {
    if (error) {
      return next({code: 503, error: '503 DB Error'});
    } else {
      // what, still here? Let's give you some data
      // TODO: update to spec
      const innerSelectStatement = 'SELECT * FROM pets WHERE name = ? AND latitude = ? AND longitude = ? LIMIT 1';
      const innerSelectParams = [ name, latitude, longitude];
      const innerSelectCallback = ( (err, row) => {
        res.send(row || err);
      });

      db.get(innerSelectStatement, innerSelectParams, innerSelectCallback);
    }
  });

  db.serialize( () => {
    isADuplicatePromise.then( (result) => {
      db.run(statement, params, callback);
      db.close();
    }).catch( (err) => {
      db.close();
      next(err);
    });
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
    + 'type_id INTEGER,'
    + 'breed_id INTEGER,'
    + 'location TEXT,'
    + 'latitude DOUBLE,'
    + 'longitude DOUBLE'
    + ')'
    );

    db.run(
      'CREATE TABLE IF NOT EXISTS breeds '
    + '('
    + 'id INTEGER PRIMARY KEY,'
    + 'name TEXT,'
    + 'type_id INTEGER'
    + ')'
    );

    // TODO: breeds should be dependent on type
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Pug\', 1)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Poodle\', 1)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'German Shepherd\', 1)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Rotweiler\', 1)');

    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Calico\', 2)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Tabby\', 2)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Tiger\', 2)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Siamese\', 2)');

    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Pidgeon\', 3)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Parrot\', 3)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Turkey\', 3)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Penguin\', 3)');

    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Gerbel\', 4)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Pikachu\', 4)');
    db.run('INSERT OR REPLACE INTO breeds (name, type_id) VALUES (\'Mouse\', 4)');

    db.run(
      'CREATE TABLE IF NOT EXISTS types'
    + '('
    + 'id INTEGER PRIMARY KEY,'
    + 'name TEXT'
    + ')'
    );

    db.run('INSERT OR REPLACE INTO types (id, name) VALUES (1, \'Dog\')');
    db.run('INSERT OR REPLACE INTO types (id, name) VALUES (2, \'Cat\')');
    db.run('INSERT OR REPLACE INTO types (id, name) VALUES (3, \'Bird\')');
    db.run('INSERT OR REPLACE INTO types (id, name) VALUES (4, \'Rodent\')');

  });

  console.log('db initialized');
  db.close();
});

app.use((err, req, res, next) => {
  console.log('middleware is draining...');
  if (err) {
    res.status(err.code).send(err);
  } else {
    next();
  }
});

app.listen(3000, () => {
  initDb();
  console.log('Example app listening on port 3000');
});
