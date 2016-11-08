#!/usr/bin/env node

/**************************************************************
* test.js is used to test the predictor.js file
* - It Connects to redis and rabbitmq
* - In the terminal 'run node test.js' to send a
*     prediction request to predictor.js and prints the output
**************************************************************/

var fs = require("fs");
var amqp = require('amqplib/callback_api');
var redis = require('redis');
var client = redis.createClient(); //creates a new client

client.on('connect', function() {
    console.log('connected');
});


// use
fs.readFile('./data/example_colleges.csv', (err, csv) => {
  if (err) throw err;
  client.set('college.csv', csv);
  console.log('Setting College CSV in Redis');
});

fs.readFile('./data/example_student.csv', (err, csv) => {
  if (err) throw err;
  client.set('student.csv', csv);
  console.log('Setting Student CSV in Redis');
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

      ch.sendToQueue('predictor_queue',
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
