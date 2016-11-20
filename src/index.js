#!/usr/bin/env node

import 'babel-polyfill';
import 'babel-core/register'
let amqp = require('amqplib/callback_api');
let redis = require('redis');
let client = redis.createClient(); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

const bilinearModel = async function(n) {
  let colleges = await client.get('college.csv');
  console.log(colleges);
  let student = await client.get('student.csv');
  console.log(student);
  return "Rensselaer";
}

const server = async function() {
    amqp.connect('amqp://rabbitmq:rabbitmq@127.0.0.1', function(err, conn) {

      if(err){
        throw err;
      }

      conn.createChannel(function(err, ch) {
        let q = 'predictor_queue';

        ch.assertQueue(q, {durable: false});
        ch.prefetch(1);
        console.log(' [x] Awaiting RPC prediction requests');
        ch.consume(q, async (msg) => {
          let n = parseInt(msg.content.toString());
          let response = await bilinearModel(n);
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(response.toString()),
            {correlationId: msg.properties.correlationId});

            ch.ack(msg);
          });
        });
      });
}

server();
