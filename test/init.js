/* eslint-disable no-undef */
'use strict';

module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {test: {memcached: {}}}).test.memcached;

global.getConfig = function() {
  var cacheConf = {
    host: process.env.MEMCACHED_HOST || config.host || 'localhost',
    port: process.env.MEMCACHEDL_PORT || config.port || 11211,
    connector: require('../')};

  return cacheConf;
};

global.getDataSource = global.getSchema = function() {
  var cache = new DataSource('memcached', getConfig());
  return cache;
};

