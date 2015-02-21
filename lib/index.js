'use strict';

var util = require('util');
var Memcached = require('memcached');
var debug = require('debug')('loopback:connector:memcached');
var Connector = require('loopback-connector').Connector;
var NAME = 'memcached';
var client = null;

// TODO: Clean up! This is probably
// not needed
var hashMe = function(key) {
  return key;
};

/**
 * Constructor for Memcached connector
 * @param {Object} settings The settings object
 * @param {DataSource} dataSource The data source
 * instance
 * @constructo
 */
var MemcachedDB = function(dataSource) {
  if (!(this instanceof MemcachedDB)) {
    return new MemcachedDB(dataSource);
  }

  Connector.call(this, NAME, dataSource.settings);

  this.debug = dataSource.settings.debug || debug.enabled;
  this.dataSource = dataSource;

  if (this.debug) {
    debug('Settings %j', dataSource.settings);
  }
};

util.inherits(MemcachedDB, Connector);

MemcachedDB.prototype.connect = function(fn) {
  if (client) {
    if (typeof fn === 'function') {
      process.nextTick(fn);
    }
  }

  client = new Memcached(this.dataSource.settings.hosts, this.dataSource.settings.options, fn);

  client.on('issue', function onIsse(e) {
    if (this.debug) {
      debug('Issue!', e);
    }
  }.bind(this))
  .on('failure', function onFailure(e) {
    if (this.debug) {
      debug('Failure!', e);
    }
  }.bind(this))
  .on('reconnecting', function onReconnecting(i) {
    if (this.debug) {
      debug('reconnecting...', i);
    }
  }.bind(this))
  .on('reconnected', function onReconnected(i) {
    if (this.debug) {
      debug('reconnected!', i);
    }
  }.bind(this))
  .on('remove', function(i) {
    if (this.debug) {
      debug('Removed server from consistent hashing', i);
    }
  }.bind(this));
};

MemcachedDB.prototype.getTypes = function onGetTypes() {
  return ['db', 'nosql', 'memcached'];
};

MemcachedDB.prototype.end = function onEnd() {
  client.end.apply(client, arguments);
};

MemcachedDB.prototype.cachedump = function onCacheDump() {
  client.cachedump.apply(client, arguments);
};

MemcachedDB.prototype.items = function onItems() {
  client.items.apply(client, arguments);
};

MemcachedDB.prototype.slabs = function onSlabs() {
  client.slabs.apply(client, arguments);
};

MemcachedDB.prototype.settings = function onSettings() {
  client.settings.apply(client, arguments);
};

MemcachedDB.prototype.version = function onVersion() {
  client.version.apply(client, arguments);
};

MemcachedDB.prototype.stats = function onStats() {
  client.stats.apply(client, arguments);
};

MemcachedDB.prototype.flush = function onFlush() {
  client.flush.apply(client, arguments);
};

MemcachedDB.prototype.del = function onDel() {
  client.del.apply(client, arguments);
};

MemcachedDB.prototype.decr = function onDecr() {
  client.decr.apply(client, arguments);
};

MemcachedDB.prototype.incr = function onIncr() {
  client.incr.apply(client, arguments);
};

MemcachedDB.prototype.append = function onAppend() {
  client.append.apply(client, arguments);
};

MemcachedDB.prototype.replace = function onReplace() {
  client.replace.apply(client, arguments);
};

MemcachedDB.prototype.add = function onAdd() {
  client.add.apply(client, arguments);
};

MemcachedDB.prototype.get = function onGet() {
  client.get.apply(client, arguments);
};

MemcachedDB.prototype.gets = function onGets() {
  client.gets.apply(client, arguments);
};

MemcachedDB.prototype.set = function onSet() {
  client.set.apply(client, arguments);
};

MemcachedDB.prototype.touch = function onTouch() {
  client.touch.apply(client, arguments);
};

MemcachedDB.prototype.format = function onFormat(data) {
  return (typeof(data) === 'object') ? JSON.stringify(data) : data;
};


/**
CRUD Ops isn't really needed, but seeing how it could
work with Memcached. 
*/
MemcachedDB.prototype.exists = function onExists(model, id, callback) {
  console.log('exists', model, id, callback)
  this.get(id, function(e, item) {
    callback(e, !!(!e && item));
  });
};

MemcachedDB.prototype.find = function(model, id, callback) {
  console.log('find', arguments);
  this.get(id, function(e, item) {
    console.log('find', e, item);
    callback(e, item);
  });
};

MemcachedDB.prototype.all = function(model, filter, callback) {
  if (filter) {
    this.find(model, filter.where, callback);
    return;
  }

  process.nextTick(function() {
    callback(new Error('Nothing found!'));
  });
};

// Add or update
MemcachedDB.prototype.save = function onSave(model, data, callback) {
  this.set(data.id, this.format(data), 100, callback);
};

// Add or update
MemcachedDB.prototype.create = function onCreate(model, data, callback) {
  this.set(data.id, this.format(data), 100, callback);
};

// Add or update
MemcachedDB.prototype.updateOrCreate = function onUpdateOrCreate(model, data, callback) {
  this.create(model, data, callback);
};

// Get a count on # of items in cache
MemcachedDB.prototype.count = function onCount(model, callback, where) {
  this.stats(function(e, res) {
    callback(e, res[0].curr_items);
  });
};

MemcachedDB.prototype.destroy = function onDestroy(model, id, callback) {
  this.del(id, function(e, res) {
    callback(e, res);
  });
};

// destroy all items
MemcachedDB.prototype.destroyAll = function onDestroyAll(model, data, callback) {
  if (data && data.id) {
    return this.destroy(model, data.id, callback);
  }

  this.flush(function(e, res) {
    callback(e, res);
  });
};

/**
 * Initialize the MongoDB connector for the given data source
 * @param {DataSource} dataSource The data source instance
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, fn) {
  var settings = dataSource.settings;
  dataSource.connector = new MemcachedDB(dataSource);
  dataSource.connector.connect(fn)
};