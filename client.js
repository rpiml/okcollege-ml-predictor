#!/usr/bin/env node

var fs = require("fs");
var amqp = require('amqplib/callback_api');
var redis = require('redis');
var client = redis.createClient(); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

fs.readFile('./data/example_colleges.csv', (err, csv) => {
  if (err) throw err;
  client.set('college.csv', csv);
  console.log('Setting College CSV in Redis');
});

amqp.connect('amqp://rabbitmq:rabbitmq@127.0.0.1', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      var corr = generateUuid();

      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == corr) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function() { conn.close(); process.exit(0) }, 500);
        }
      }, {noAck: true});

      ch.sendToQueue('rpc_queue',
        new Buffer('request for machine learning'),
        { correlationId: corr, replyTo: q.queue });
    });
  });
});

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
