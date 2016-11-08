#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var redis = require('redis');
var client = redis.createClient(); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

amqp.connect('amqp://rabbitmq:rabbitmq@127.0.0.1', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'rpc_queue';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    ch.consume(q, function reply(msg) {
      var n = parseInt(msg.content.toString());

      console.log(" [.] Received Request");

      var response = bilinearModel(n);

      console.log("Recommending", response);

      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(response.toString()),
        {correlationId: msg.properties.correlationId});

      ch.ack(msg);
    });
  });
});

function bilinearModel(n) {
  console.log()
  client.get('college.csv', function(err, colleges) {
    console.log(colleges);
});
  return "Rensselaer";
}