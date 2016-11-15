#!/usr/bin/env node

/**************************************************************
* test.js is used to test the predictor.js file
* - It Connects to redis and rabbitmq
* - In the terminal 'run node test.js' to send a
*     prediction request to predictor.js and prints the output
**************************************************************/


import 'babel-polyfill';
import fs from 'fs';
import amqp from 'amqplib/callback_api';
import redis from 'redis';
import should from 'should';
import {expect} from 'chai';

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

describe('Send A RPC via Rabbitmq', () => {


    let client;

    before(async () => {
      client = redis.createClient(); //creates a new client
      client.on('connect', () => {
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

    });

    it('should return a college',  async function() {
      amqp.connect('amqp://rabbitmq:rabbitmq@127.0.0.1', function(err, conn) {
        conn.createChannel(function(err, ch) {
          ch.assertQueue('', {exclusive: true}, function(err, q) {
            var corr = generateUuid();

            ch.consume(q.queue, function(msg) {
              if (msg.properties.correlationId == corr) {
                console.log(' [.] Got %s', msg.content.toString());
                setTimeout(function() { conn.close(); process.exit(0) }, 500);
                expect(msg.content).to.not.be.undefined;
              }
            }, {noAck: true});

            ch.sendToQueue('predictor_queue',
              new Buffer('request for machine learning'),
              { correlationId: corr, replyTo: q.queue });
          });
        });
      });
    });
});
