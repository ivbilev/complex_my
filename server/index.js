// import keys
const keys = require('./keys');


//Express app setup
//import modules e.g express library 
const express = require('express');
const bodyParser = require('body-parser');
const cors= require('corse');

//Make new express application object that is going to receive and respond any http request
const app = express();
//tell the app to use cors
app.use(cors());
//tell the app to use body parser pars body to json
app.use(bodyParser.join());


//Postgres client setup
//requier in pool module
const { Pool } = require('pg');
const pgClient = newPool({
   user: keys.pgUser,
   host: keys.pgHost,
   database: keys.pgDatabase,
   password: keys.pgPassword,
   port: keys.pgPort
});

//error listener 
pgClient.on('error', () => console.log('Lost PG connection'));


//Create a table 
pgClient
   .query('CREATE TABLE IF NOT EXITS values (number INT)')
   .catch(error = console.log(err));

//connect oredis instance from the expess api
//Redis Client
const redis = require('redis');
const redisClient = redis.createClient({
   host: keys.redisHost,
   port: keys.redisPort,
   retry_strategy: () => 1000
});
//duplicate connection, if we have already client listening or publishing we have to make duplicate connection, because it cannot be used
const redisPublisher = redisClient.duplicate();


//Express route hanndlers
//test route, app.get called with requests and response
//when a request is made to the roor route to our express app, we send response hi
app.get('/', (req, res) => {
   res.send('Hi');
});
// query all submited values to the postgres and return them
app.get('/values/all', async (req, res) => {
   const values = await pgClient.query('SELECT * from values');
   res.send(values.rows);
});

//Reach redis and query all indexes and values ever been submited
// callbacks used here, await (promise support) not supported
app.get('/values/current', async (req, res) => {
//look at the hash of 'values' inside redis and get all info from it , next is call back function (err, values)
   redisClient.hgetall('values', (err, values) => {
       res.send(values);
   });
});

//handler to receive values from react app , what user submited
app.post('/values', async (req, res) => {
   const index = req.body.index;
   
   if (parseInt(index) > 40) {
      return res.status(422).send('Index too high')
   }
   //put the index value from above to redis
   redisClient.hset('values', index, 'Nothing yet!');
   redisPublisher.publish('insert', index);
   pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

   res.send({ working: true });


});

app.listen(5000, err => {
   //call back
   console.log('Listening')
});
