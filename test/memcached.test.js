'use strict';
var should = require('should');
var assert = require('assert');
var MemcachedConnector = require('../');
var loopback = require('loopback');
var MyCache, db;

describe('Memcached and Model', function() {
  beforeEach(function() {
    var settings = {host: 'localhost',
      port: 11211};
    MyCache = loopback.Model.extend('myModel');
    var ds = loopback.createDataSource('memcachedModel',
      {connector: MemcachedConnector});
    MyCache.attachTo(ds);
  });

  it('should have a set method', function() {
    should.equal(typeof MyCache.set === 'function', true);
    should.equal(typeof MyCache.prototype.set === 'function', true);
  });
});

describe('MyCache', function() {
  var testKey = 'a';
  var testValue = [{test: 1}];
  it('MyCache.set(key, value, ttl, callback)', function(done) {
    MyCache.set(testKey, testValue, 10, function(err, res) {
      should.not.exist(err);
      should.exist(res);
      done();
    });
  });

  it('MyCache.set(key, value, ttl) *Promise', function(done) {
    MyCache.set(testKey, testValue, 200)
      .then(function(results) {
        should.exist(results);
        done();
      });
  });

  it('MyCache.get(key, callback)', function(done) {
    MyCache.get(testKey, function(err, res) {
      should.not.exist(err);
      should.deepEqual(res, testValue);
      done(err);
    });
  });

  it('MyCache.get(key) *Promise', function(done) {
    MyCache.get(testKey)
      .then(function(results) {
        should.deepEqual(results, testValue);
        done();
      });
  });

  it('MyCache.getMulti(keys, callback)', function(done) {
    var keys = [testKey, 'b'];
    MyCache.set('b', {test: 1}, 10, function(err, res) {
      MyCache.getMulti(keys, function(err, res) {
        should.not.exist(err);
        should.deepEqual(res.a, testValue);
        should.deepEqual(res.b, {test: 1});
        done(err);
      });
    });
  });

  it('MyCache.getMulti(keys) *Promise', function(done) {
    var keys = [testKey, 'b'];
    MyCache.set('b', {test: 1}, 10)
      .then(function() {
        return MyCache.getMulti(keys);
      })
      .then(function(results) {
        should.deepEqual(results.a, testValue);
        should.deepEqual(results.b, {test: 1});
        done();
      });
  });

  it('MyCache.add(key, value, ttl, callback)', function(done) {
    MyCache.add('c', {test: 1}, 10, function(err, res) {
      should.not.exist(err);
      MyCache.get('c', function(err, res) {
        should.not.exist(err);
        should.deepEqual(res, {test: 1});
        done(err);
      });
    });
  });

  it('MyCache.add(key, value, ttl) *Promise', function(done) {
    MyCache.add('c2', {test: 1}, 10)
      .then(function() {
        return MyCache.get('c');
      }).then(function(results) {
        should.deepEqual(results, {test: 1});
        done();
      });
  });

  it('MyCache.replace(key, value, ttl, callback)', function(done) {
    MyCache.replace(testKey, {test: 4}, 200, function(err, res) {
      should.not.exist(err);
      MyCache.get(testKey, function(err, res) {
        should.deepEqual(res, {test: 4});
        done();
      });
    });
  });

  it('MyCache.replace(key, value, ttl) *Promise', function(done) {
    MyCache.set('d2', {test: 1}, 10)
      .then(function() {
        return MyCache.replace('d2', {test: 2}, 10);
      })
      .then(function() {
        return MyCache.get('d2');
      })
      .then(function(results) {
        should.deepEqual(results, {test: 2});
        done();
      });
  });

  it('MyCache.del(key, callback)', function(done) {
    MyCache.set('c', {test: 1}, 10, function(err, res) {
      should.not.exist(err);
      MyCache.del('c', function(err, res) {
        should.not.exist(err);
        should.exist(res);
        done(err);
      });
    });
  });

  it('MyCache.del(key) *Promise', function(done) {
    MyCache.set('c', {test: 1}, 10)
      .then(function() {
        return MyCache.del('c');
      })
      .then(function(results) {
        should.exist(results);
        done();
      });
  });
});

