/*
Author: Joyce Shendre
Description:  This file consists of functions for authoriztion of  Microsoft Teams Account
and return auth-token
*/

const axios = require('axios');
const qs = require('qs');
const Q = require('q');

//Azure Active Directory Credentials
const postData = {
  client_id: process.env.clientId,
  scope: process.env.MS_GRAPH_SCOPE,//API Permissions kept default
  client_secret: process.env.clientSecret,
  // grant_type: 'password',
  grant_type: 'client_credentials',
  username: process.env.username, //Azure Active Directory login credentials
  password: process.env.password
};

var accessToken;
var auth = {};
auth.getAccessToken = function () {
  var deferred = Q.defer();
  try {
    axios.defaults.headers.post['Content-Type'] =
      'application/x-www-form-urlencoded';

    axios.post(process.env.TOKEN_END_POINT_GRAPH_AUTH, qs.stringify(postData))
      .then(response => {
        accessToken = response.data.access_token;
        deferred.resolve(accessToken);
      })
      .catch(error => {
        console.log(error);
        deferred.reject(error);
      });
    return deferred.promise;

  } catch (exception) {
    console.log(exception)
  }
}

module.exports = auth;