const keys = require('./keys');
const redis = require('redis');

const redisCient = redis.createClient({
   host: keys.redisHost,
   port: keys.redisPort,
   retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index) {
   if (index < 2) return 1;
   return fib(index - 1) + fib(index - 2);
}

sub.on('message', (chanel, message) => {
   redisClient.hset('values', messa, fib(parseInt(message)));
});
sub.subscribe('insert');