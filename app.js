const express     = require('express');
const bodyParser  = require('body-parser');
const sqlite3     = require('sqlite3').verbose();
const pg          = require('pg');

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgres://jperih:@localhost/petshelterapi';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello world!');
  next();
});

app.get('/types', (req, res, next) => {
  pg.connect(CONNECTION_STRING, (err, client, done) => {
    const selectStatement = 'SELECT * FROM types';
    const selectParams = [];
    client.query(selectStatement, selectParams, (err, result) => {
      if (!result.rows) {
        res.status(404).send({code: 404, error: 'Not found' });
      } else {
        res.status(200).send(result.rows);
      }
      done();
      next();
    });
  });
});

app.get('/breeds', (req, res, next) => {
  pg.connect(CONNECTION_STRING, (err, client, done) => {
    const selectStatement = 'SELECT * FROM breeds';
    const selectParams = [];
    client.query(selectStatement, selectParams, (err, result) => {
      if (!result.rows) {
        res.status(404).send({code: 404, error: 'Not found' });
      } else {
        res.status(200).send(result.rows);
      }
      done();
      next();
    });
  });
});

app.get('/pets', (req, res, next) => {
  pg.connect(CONNECTION_STRING, (err, client, done) => {
    const selectStatement = 'SELECT * FROM pets';
    const selectParams = [];
    client.query(selectStatement, selectParams, (err, result) => {
      if (!result.rows) {
        res.status(404).send({code: 404, error: 'Not found' });
      } else {
        res.status(200).send(result.rows);
      }

      done();
      next();
    });
  });
});

app.get('/pets/:id', (req, res, next) => {
  const { id } = req.params;

  pg.connect(CONNECTION_STRING, (err, client, done) => {
    const selectStatement = 'SELECT pets.type_id, pets.breed_id, types.name, breeds.name, pets.name, pets.location, pets.latitude, pets.longitude FROM pets JOIN breeds ON pets.breed_id = breeds.id JOIN types ON pets.type_id = types.id WHERE pets.id = ?';
    const selectParams = [];
    client.query(selectStatement, selectParams, (err, result) => {
      if (!result) {
        res.status(404).send({code: 404, error: 'Not found' });
      } else {
        res.status(200).send(result);
      }

      done();
      next();
    });
  });
});

app.post('/pets', (req, res, next) => {
  const { name, type_id, breed_id, location, latitude, longitude } = req.body;

  // IS THERE ALREADY A RECORD?
  // TODO: actually refactor to get OUT OF HERE when there is another record of same
  const isADuplicatePromise = new Promise((resolve, reject) => {
    pg.connect(CONNECTION_STRING, (err, client, done) => {
      const selectStatement = 'SELECT * FROM pets WHERE name = $1 AND type_id = $2';
      const selectParams = [ name, type_id ];
      const selectCallback = ( (err, result, done) => {

        if (result.rowCount > 0) {
          reject({code: 409, error: '409 Record Already Exists.'});
        } else {
          resolve();
        }
      });
      client.query(selectStatement, selectParams, selectCallback);
    });
  });

  // TODO: input validation
  const statement = 'INSERT INTO pets ( name, type_id, breed_id, location, latitude, longitude ) VALUES ( $1, $2, $3, $4, $5, $6 );';
  const params = [ name, type_id, breed_id, location, latitude, longitude ];

  isADuplicatePromise.then( (result) => {
    pg.connect(CONNECTION_STRING, (err, client, done) => {
      const callback = ((error) => {
        if (error) {
          return next({code: 503, error: error});
        } else {
          // what, still here? Let's give you some data
          pg.connect(CONNECTION_STRING, (err, result, done) => {
            const innerSelectStatement = 'SELECT * FROM pets WHERE name = $1 AND latitude = $2 AND longitude = $3 AND BREED_ID = $4 AND TYPE_ID = $5 LIMIT 1';
            const innerSelectParams = [ name, latitude, longitude, breed_id, type_id ];
            const innerSelectCallback = ( (err, row, done) => {
              res.send(row.rows[0] || err);
            });
            client.query(innerSelectStatement, innerSelectParams, innerSelectCallback);
          });
        }
      });
      client.query(statement, params, callback);
    });
  }).catch( (err) => {
    next(err);
  });
});

const initDb = (() => {
  pg.connect(CONNECTION_STRING, (err, client, done) => {
    client.query(
      'CREATE TABLE IF NOT EXISTS pets '
      + '('
      + 'id SERIAL,'
      + 'name TEXT,'
      + 'type_id INT,'
      + 'breed_id INT,'
      + 'location TEXT,'
      + 'latitude DOUBLE PRECISION,'
      + 'longitude DOUBLE PRECISION'
      + ')'
    );

    client.query(
      'CREATE TABLE IF NOT EXISTS breeds '
      + '('
      + 'id INT PRIMARY KEY,'
      + 'name TEXT,'
      + 'type_id INT'
      + ')'
    );

    client.query(
      'CREATE TABLE IF NOT EXISTS types'
    + '('
    + 'id INT PRIMARY KEY,'
    + 'name TEXT'
    + ')'
    );

    client.query('INSERT INTO breeds (id, name, type_id) VALUES (1, \'Pug\', 1) ON CONFLICT (id) DO NOTHING' );
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (2, \'Poodle\', 1) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (3, \'German Shepherd\', 1) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (4, \'Rotweiler\', 1) ON CONFLICT (id) DO NOTHING');

    client.query('INSERT INTO breeds (id, name, type_id) VALUES (5, \'Calico\', 2) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (6, \'Tabby\', 2) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (7, \'Tiger\', 2) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (8, \'Siamese\', 2) ON CONFLICT (id) DO NOTHING');

    client.query('INSERT INTO breeds (id, name, type_id) VALUES (9, \'Pidgeon\', 3) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (10, \'Parrot\', 3) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (11, \'Turkey\', 3) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (12, \'Penguin\', 3) ON CONFLICT (id) DO NOTHING');

    client.query('INSERT INTO breeds (id, name, type_id) VALUES (13, \'Gerbel\', 4) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (14, \'Pikachu\', 4) ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO breeds (id, name, type_id) VALUES (15, \'Mouse\', 4) ON CONFLICT (id) DO NOTHING');

    client.query('INSERT INTO types (id, name) VALUES (1, \'Dog\') ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO types (id, name) VALUES (2, \'Cat\') ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO types (id, name) VALUES (3, \'Bird\') ON CONFLICT (id) DO NOTHING');
    client.query('INSERT INTO types (id, name) VALUES (4, \'Rodent\') ON CONFLICT (id) DO NOTHING');

    console.log('db initialized');

    done();
  });
});

app.use((err, req, res, next) => {
  console.log('middleware is draining...');
  if (err) {
    res.status(err.code).send(err);
  } else {
    next();
  }
});

const HTTP_PORT = process.env.PORT || 3000;
app.listen(HTTP_PORT, () => {
  initDb();
  console.log(`Example app listening on port ${HTTP_PORT}`);
});
