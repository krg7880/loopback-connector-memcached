'use strict';

require('./init.js');
var assert = require('assert');
var should = require('should');
var DataSource = require('loopback-datasource-juggler').DataSource;
var memcachedConnector = require('../');
var url = require('url');

var cache, ocache, config;

describe('connections', function() {
  before(function() {
    require('./init.js');

    config = global.getConfig();

    ocache = getDataSource();
    cache = ocache;
  });

  it('should pass with valid settings', function(done) {
    var db = new DataSource(memcachedConnector, config);
    db.ping(done);
  });

  it('should disconnect first connection', function(done) {
    cache.disconnect(function() {
      ocache = getDataSource();
      done();
    });
  });
});
