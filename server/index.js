const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const util = require('util');
const keys = require('./keys');

// Express app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost Postgres connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// Redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  const redisClientHgetall = util.promisify(redisClient.hgetall);
  const values = await redisClientHgetall('values');
  res.send(values);
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 30) {
    return res.status(422).send('Index too high');
  }

  // save the index value to Redis
  redisClient.hset('values', index, 'Nothing yet!');
  // publish so that the worker can calculate fib value and save to Redis
  redisPublisher.publish('insert', index);
  // also save index value to Postgres
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Listening on port 5000...');
});