/* eslint-disable no-undef */
'use strict';

require('./init.js');
var assert = require('assert');
var should = require('should');
var DataSource = require('loopback-datasource-juggler').DataSource;
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
    this.timeout(10000);
    var db = new DataSource('memcached', config);
    db.ping(function(err, res) {
      should.not.exist(err);
      assert(res);
      db.disconnect(done);
    });
  });

  it('should start a connection with options', function(done) {
    config.options = {retries: 10, retry: 10000, remove: true, failOverServers: ['192.168.0.103:11211']};
    var db = new DataSource('memcached', config);
    db.ping(function(err, res) {
      should.not.exist(err);
      assert(res);
      db.disconnect(done);
    });
  });

  it('should flush first connection', function(done) {
    cache.connector.flush(function(err, res) {
      should.not.exist(err);
      assert(res);
      done();
    });
  });

  it('should disconnect first connection', function(done) {
    cache.disconnect(function(err, res) {
      should.not.exist(err);
      assert(res);
      ocache = getDataSource();
      done();
    });
  });
});
