'use strict';
var util = require('util');
var Memcached = require('memcached');
var debug = require('debug')('loopback:connector:memcached');
var Connector = require('loopback-connector').Connector;
var NAME = 'memcached';
var client = null;
var _debug = false;

var log = function() {
  if (_debug) {
    debug.apply(debug, arguments);
  }
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
  
  this.name = NAME;
  this.settings = dataSource.settings;
  _debug = dataSource.settings.debug || debug.enabled;

  this.connect();

  if (this.debug) {
    debug('Settings %j', dataSource.settings);
  }
};

util.inherits(MemcachedDB, Connector);

MemcachedDB.prototype.connect = function(fn) {
  client = new Memcached(this.settings.hosts, this.settings.options);

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

MemcachedDB.prototype.serialize = function onFormat(data) {
  return (typeof(data) === 'object') ? JSON.stringify(data) : data;
};

MemcachedDB.prototype.deserialize = function onFormat(data) {
  return (typeof(data) === 'object') ? JSON.parse(data) : data;
};

MemcachedDB.prototype.updateAttributes = function() {
  log('index::updateAttributes', arguments, arguments.length);
};

MemcachedDB.prototype.find = function(model, id, callback) {
  if (typeof (id) === 'undefined') {
    return callback(new Error("Please specify a cache id"));
  }

  client.get(id, function(e, res) {
    if (!e && res) {
      res = JSON.parse(res)
    }

    callback(e, [res]);
  });
};

MemcachedDB.prototype.findById = function(id, callback) {
  log('index::findById', arguments.length, arguments);
  this.find(id, callback)
};

MemcachedDB.prototype.findOne = function(id, callback) {
  log('index::findOne', arguments.length, arguments);
  this.find(id, callback);
};

MemcachedDB.prototype.all = function(model, filter, callback) {
  log('index::all', arguments.length, arguments);

  if (filter) {
    var id = (filter.where && filter.where.id) ? filter.where.id : filter.id;
    this.find(model, id, callback);
    return;
  }

  process.nextTick(function() {
     callback(new Error('Nothing found!'));
  });
};

MemcachedDB.prototype.save = function onSave(model, data, callback) {
  log('index::save');
  transaction.set(data.id, this.serialize(data), 100, callback);
};

/**
CRUD Ops isn't really needed, but seeing how it could
work with Memcached. 
*/
MemcachedDB.prototype.exists = function onExists(id, callback) {
  log('exists %d', id);
  transaction.get(id, function(e, item) {
    callback(e, !!(!e && item));
  });
};

MemcachedDB.prototype.create = function onCreate(name, data, callback) {
  log('create', arguments);
  if (typeof (data) === 'undefined' || typeof (data.id) === 'undefined') {
    return callback(new Error("Missing data or record id (id)"));
  }

  log('create', data);
  client.set(data.id, data.data, data.ttl, callback);
};

MemcachedDB.prototype.upsert = function onUpsert(model, callback) {
  log('upsert');
  this.create(model, callback);
};

MemcachedDB.prototype.updateOrCreate = function onUpdateOrCreate(model, data, callback) {
  log('index::updateOrCreate', arguments.length, arguments);
  this.create(model, data, callback);
};

// Add or update
MemcachedDB.prototype.updateAll = function onUpdateAll(id, data, callback) {
  this.create(data, callback);
};


// Get a count on # of items in cache
MemcachedDB.prototype.count = function onCount(model, callback, where) {
  log('index::count');
  client.stats(function(e, res) {
    callback(e, (!e && res && res.length) ? res[0].curr_items : null);
  });
};

MemcachedDB.prototype.destroy = function onDestroy(model, id, callback) {
  client.del(id, callback);
};

// destroy all items
MemcachedDB.prototype.destroyAll = function onDestroyAll(model, data, callback) {
  if (data && data.id) {
    return this.destroy(model, data.id, callback);
  }

  client.flush(callback);
};

MemcachedDB.prototype.deleteById = function onDeleteById(id, callback) {
  client.del(id, callback);
};

/**
 * Initialize the MemcachedDB connector for the given data source
 * @param {DataSource} dataSource The data source instance
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, fn) {
  var settings = dataSource.settings;
  var connector = new MemcachedDB(dataSource);

  dataSource.connector = connector;
  dataSource.dataSource = dataSource;
  
  if (typeof(fn) === 'function') {
    process.nextTick(fn);
  }
};