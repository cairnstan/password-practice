var express = require('express');
var passport = require('passport');
var session = require('express-session');
var localStrategy = require('passport-local').Strategy;
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');


var connection = require('./db/connection');
var index = require('./routes/index');
var register = require('./routes/register')
var users = require('./routes/users');
var encryptLib = require('../encryption');

var connectionString = connection.connectionString

var app = express();
var port = process.env.PORT || 3000;

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 6000000, secure: false}
}));

app.use(express.static('server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());



connection.initializeDB();




passport.use('local', new localStrategy({
  passReqToCallback : true,
  usernameField: 'username'
},
  function(req, username, password, done) {
    console.log('called local initial');
    pg.connect(connectionString, function (err, client) {
      console.log('called local- pg');
      var user = {};

        var query = client.query('SELECT * FROM users WHERE username = $1', [username]);

        query.on('row', function(row) {
          console.log('User object ', row);
          console.log('Password ', password);
          user = row;
          if(encryptLib.comparePassword(password, user.password)) {
            console.log('user match password');
            done(null, user);
          } else {
            done(null, false, {message: 'Incorrect username and password.'});
          }
        });
        //data is returned, close connection and return results
        query.on('end', function () {
          // res.send('these are the results from localStrategy ', results);
          client.end();
        });
        //handle errors
        if(err) {
          console.log('local strategy ', err);
        }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('called deserializeUser initial');
  pg.connect(connectionString, function (err, client) {
    var user = {};
    console.log('called deserializeUser - pg');
      var query = client.query('SELECT * FROM users WHERE id = $1', [id]);

      query.on('row', function (row) {
        console.log('User row ', row);
        user = row;
        done(null, user);
      });

      //after all the data is returned, this will close connection and return results
      query.on('end', function () {
        client.end();
      });

      //handle the errors
      if(err) {
        console.log('deserializeUser ', err);
      }
  });
});

//Routes
app.use('/', index);
app.use('/register', register);
app.use('/users', users);

var server = app.listen(port, function(){
  console.log('Listening on port ', port);
})
