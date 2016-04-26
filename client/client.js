var app = angular.module('passportApp', []);
console.log('angular is connected to index.html');

app.controller = ('passportController',['$http' function($http){

  $http.get('/users').then(function(response){
    console.log('response from /users ', response);
  })
}])
