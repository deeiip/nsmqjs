

(function() {
  var RSMQ, app, express, rsmq;

  RSMQ = require("rsmq");
  
  //rsmq = new RSMQ( {host: "127.0.0.1", port: 6379, ns: "rsmq"} );
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  //var redis = require("redis").createClient(rtg.port, rtg.hostname);
  rsmq = new RSMQ( {host: rtg.hostname, port: rtg.port, ns: "rmsq"} );
  //rsmq = new RSMQ();

  express = require('express');

  app = express();

  app.use(function(req, res, next) {
    res.header('Content-Type', "application/json");
    res.removeHeader("X-Powered-By");
    next();
  });

  app.configure(function() {
    app.use(express.logger("dev"));
    app.use(express.bodyParser());
  });

  app.get('/queues', function(req, res) {
    return rsmq.listQueues(function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        queues: resp
      });
    });
  });

  app.get('/queues/:qname', function(req, res) {
    return rsmq.getQueueAttributes({
      qname: req.params.qname
    }, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send(resp);
    });
  });

  app.post('/queues/:qname', function(req, res) {
    var params;

    params = req.body;
    params.qname = req.params.qname;
    rsmq.createQueue(params, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        result: resp
      });
    });
  });

  app["delete"]('/queues/:qname', function(req, res) {
    return rsmq.deleteQueue({
      qname: req.params.qname
    }, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        result: resp
      });
    });
  });

  app.post('/messages/:qname', function(req, res) {
    var params;

    params = req.body;
    params.qname = req.params.qname;
    rsmq.sendMessage(params, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        id: resp
      });
    });
  });

  app.get('/messages/:qname', function(req, res) {
    rsmq.receiveMessage({
      qname: req.params.qname,
      vt: req.param("vt")
    }, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send(resp);
    });
  });

  app.put('/messages/:qname/:id', function(req, res) {
    rsmq.changeMessageVisibility({
      qname: req.params.qname,
      id: req.params.id,
      vt: req.param("vt")
    }, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        result: resp
      });
    });
  });

  app["delete"]('/messages/:qname/:id', function(req, res) {
    rsmq.deleteMessage(req.params, function(err, resp) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send({
        result: resp
      });
    });
  });

  module.exports = app;

}).call(this);
