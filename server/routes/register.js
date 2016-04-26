var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var pg = require('pg');
var connection = require('../db/connection');
var encryptLib = require('../../encryption');

var connectionString = connection.connectionString

router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '../public/views/users.html'));
});



router.post('/', function(req, res, next) {
  pg.connect(connectionString, function(err, client) {
    var user = {
      username: req.body.username,
      password: encryptLib.encryptPassword(req.body.password)
    };

    var query = client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [user.username, user.password]);

    query.on('error', function(err) {
      console.log('insert data ', err);
    })
    query.on('end', function(){
      res.sendStatus(200);
      client.end();
    })
  })
});

module.exports = router;
