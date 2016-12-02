#!/usr/bin/env node

import 'babel-polyfill';
import 'babel-core/register'
let amqp = require('amqplib/callback_api');
let redis = require('redis');
let client = redis.createClient({
  host: process.env["REDIS_HOST"] || "localhost"
}); //creates a new client
const rabbitmqAddress = `amqp://rabbitmq:rabbitmq@${process.env['RABBITMQ_HOST'] || 'localhost'}`;

client.on('connect', function() {
    console.log('connected to redis');
});

const bilinearModel = async function(n) {
  let colleges = await client.get('college.csv');
  let student = await client.get('student.csv');
  return "1501,299,279";
};

const server = async function() {
  amqp.connect(rabbitmqAddress, function(err, conn) {

    if(err){
      throw err;
    }

    conn.createChannel(function(err, ch) {
      let q = 'predictor_queue';

      ch.assertQueue(q, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC prediction requests');
      ch.consume(q, async (msg) => {
        let content = msg.content.toString();
        let response = await bilinearModel(content);
        ch.sendToQueue(msg.properties.replyTo,
          new Buffer(response.toString()),
          {correlationId: msg.properties.correlationId});

        ch.ack(msg);
      });
    });
  });
};

function startServer(){
  server().catch(e => {
    console.log(`Server Crashed with ${e.toString()}`);
    console.log("Restarting in 1 second...");
    setTimeout(() => {
      startServer();
    }, 1000);
  })
}

startServer()
