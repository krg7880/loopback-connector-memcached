'use strict';

module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {test: {memcached: {}}}).test.memcached;
console.log(config);
global.getConfig = function() {
  var cacheConf = {
    host: process.env.MEMCACHED_HOST || config.host || 'localhost',
    port: process.env.MEMCACHEDL_PORT || config.port || 11211,
  };

  return cacheConf;
};

global.getDataSource = global.getSchema = function() {
  var cache = new DataSource(require('../'), getConfig());
  return cache;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
};

