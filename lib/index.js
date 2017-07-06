'use strict';

var util = require('util');
var Memcached = require('memcached');
var Promise = require('bluebird');
var debug = require('debug')('loopback:connector:memcached');
var NAME = 'memcached';
var _debug = false;
var assert = require('assert');
const DFLT_TIMEOUT = 1000;
const DFLT_RETRIES = 0;
const DFLT_FAILURES = 0;
const DFLT_RECONNECT = 60000;

var log = function() {
  if (_debug) {
    debug.apply(debug, arguments);
  }
};

/**
 * Export the MemcachedDB connector class.
 */

module.exports = MemcachedDB;

/**
 *
 * Create an instance of the connector with the given settings
 * Defaults settings for timeout, retries, failures, and reconnect to:
 * Timeout: 1000
 * Retries: 0
 * Failures: 0
 * Reconnect: 60000
 *
 * @param settings
 * @returns {MemcachedDB}
 * @constructor
 */
function MemcachedDB(settings) {
  if (!(this instanceof MemcachedDB)) {
    return new MemcachedDB(settings);
  }

  this.name = NAME;
  this.host = settings.host || 'localhost';
  this.port = settings.port || 11211;
  this.location = `${this.host}:${this.port}`;

  if (!settings.options) {
    settings.options =
      {timeout: DFLT_TIMEOUT,
        retries: DFLT_RETRIES,
        failures: DFLT_FAILURES,
        reconnect: DFLT_RECONNECT};
  } else {
    settings.options.timeout = settings.options.timeout || DFLT_TIMEOUT;
    settings.options.retries = settings.options.retries || DFLT_RETRIES;
    settings.options.failures = settings.options.failures || DFLT_FAILURES;
    settings.options.reconnect = settings.options.reconnect || DFLT_RECONNECT;
  }

  this.settings = settings;
  _debug = settings.debug || debug.enabled;

  this.connect();

  if (this.debug) {
    debug('Settings %j', settings);
  }
};

MemcachedDB.intialize = function(dataSource, callback) {
  dataSource.connector = new MemcachedDB(dataSource.settings);
  callback();
};

MemcachedDB.prototype.DataAccessObject = Cache;

function Cache() {
}

MemcachedDB.prototype.connect = function() {
  this.client = new Memcached(this.location, this.settings.options);

  this.client.on('issue', function(e) {
    log('Issue!', e);
  }.bind(this))
    .on('failure', function(e) {
      log('Failure!', e);
    }.bind(this))
    .on('reconnecting', function(i) {
      log('reconnecting...', i);
    }.bind(this))
    .on('reconnected', function(i) {
      log('reconnected!', i);
    }.bind(this))
    .on('remove', function(i) {
      log('Removed server from consistent hashing', i);
    }.bind(this));
};

MemcachedDB.prototype.disconnect = function(callback) {
  if (typeof this.client === 'undefined') {
    callback(new Error('Memcached not connected, must connect first'));
  }
  this.client.end();
  callback(null, true);
};

MemcachedDB.prototype.ping = function(callback) {
  if (typeof this.client === 'undefined') {
    callback(new Error('Memcached not connected, must connect first'));
  }
  this.client.stats(function(err, cb) {
    callback(err, true);
  });
};

MemcachedDB.prototype.getClient = function() {
  return this.client;
};

MemcachedDB.prototype.flush = function(callback) {
  if (typeof this.client === 'undefined') {
    callback(new Error('Memcached not connected, must connect first'));
  }
  this.client.flush(function(err, cb) {
    callback(err, true);
  });
};

/**
 * For descriptions of the following methods please see https://github.com/3rd-Eden/memcached
 */
Cache.set = function(key, value, ttl, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(key);
  assert(typeof value !== 'undefined' && value !== null);
  assert(ttl);

  if (debug.enabled) {
    log('Set:');

    log('\t KEY:%s', key);
    log('\t VALUE:%s', value);
    log('\t TTL:%s', ttl);
  }

  const promise = new Promise(function(resolve, reject) {
    client.set(key, value, ttl, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.set = function(fn) {
  this.constructor.set(this, fn);
};

Cache.get = function(key, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(key);

  if (debug.enabled) {
    log('Get:');

    log('\t KEY:%s', key);
  }

  const promise = new Promise(function(resolve, reject) {
    client.get(key, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.get = function(fn) {
  this.constructor.get(this, fn);
};

Cache.getMulti = function(keys, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(Array.isArray(keys), 'keys must be an array!');

  if (debug.enabled) {
    log('GetMulti:');

    log('\t KEYS:%s', keys);
  }

  const promise = new Promise(function(resolve, reject) {
    client.getMulti(keys, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.getMulti = function(fn) {
  this.constructor.get(this, fn);
};

Cache.add = function(key, value, ttl, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(key);
  assert(typeof value !== 'undefined' && value !== null);
  assert(ttl);

  if (debug.enabled) {
    log('Add:');

    log('\t KEY:%s', key);
    log('\t VALUE:%s', value);
    log('\t TTL:%s', ttl);
  }

  const promise = new Promise(function(resolve, reject) {
    client.add(key, value, ttl, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.add = function(fn) {
  this.constructor.add(this, fn);
};

Cache.replace = function(key, value, ttl, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(key);
  assert(typeof value !== 'undefined' && value !== null);
  assert(ttl);

  if (debug.enabled) {
    log('Replace:');

    log('\t KEY:%s', key);
    log('\t VALUE:%s', value);
    log('\t TTL:%s', ttl);
  }

  const promise = new Promise(function(resolve, reject) {
    client.replace(key, value, ttl, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.replace = function(fn) {
  this.constructor.replace(this, fn);
};

Cache.del = function(key, callback) {
  var dataSource = this.dataSource;
  var connector = dataSource.connector;
  var client = connector.getClient();
  assert(connector, 'Cannot cache without a connector!');
  assert(key);

  if (debug.enabled) {
    log('Del:');

    log('\t KEY:%s', key);
  }

  const promise = new Promise(function(resolve, reject) {
    client.del(key, function(err, response) {
      if (err) reject(err);

      resolve(response);
    });
  });

  if (callback && typeof callback === 'function') {
    promise.then(callback.bind(null, null), callback);
  }

  return promise;
};

Cache.prototype.del = function(fn) {
  this.constructor.del(this, fn);
};

