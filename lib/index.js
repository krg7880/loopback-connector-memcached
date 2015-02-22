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
  
  this.name = NAME;
  this.settings = dataSource.settings;
  this.debug = dataSource.settings.debug || debug.enabled;

  this.connect();

  if (this.debug) {
    debug('Settings %j', dataSource.settings);
  }
};

util.inherits(MemcachedDB, Connector);

// MemcachedDB.prototype.define = function (modelDefinition) {
//   if (!modelDefinition.settings) {
//     modelDefinition.settings = {};
//   }

//   modelDefinition.settings.base = 'Model';
//   console.log(modelDefinition.settings);
//   this._models[modelDefinition.model.modelName] = modelDefinition;
// };

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
  return ['db', 'memcached'];
};

MemcachedDB.prototype.end = function onEnd() {
  client.end.apply(client, arguments);
};

MemcachedDB.prototype.cachedump = function onCacheDump(callback) {
  console.log('index::cachedump', arguments.length, arguments);
  client.cachedump(client, callback);
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

MemcachedDB.prototype.serialize = function onFormat(data) {
  return (typeof(data) === 'object') ? JSON.stringify(data) : data;
};

MemcachedDB.prototype.deserialize = function onFormat(data) {
  return (typeof(data) === 'object') ? JSON.parse(data) : data;
};


/**
CRUD Ops isn't really needed, but seeing how it could
work with Memcached. 
*/
MemcachedDB.prototype.exists = function onExists(id, callback) {
  if (this.debug) {
    debug('exists %d', id);
  }

  this.get(id, function(e, item) {
    callback(e, !!(!e && item));
  });
};

/**
Implements the all method -- not very
useful in the context of Memcached unless
an id is passed.

@TODO consider how to effectively utilized
this method if at all
*/
MemcachedDB.prototype.all = function(model, filter, callback) {
  if (filter) {
    this.find(model, filter.where, callback);
    return;
  }

  process.nextTick(function() {
    callback(new Error('Nothing found!'));
  });
};

/**
Finds a cached item by the given ID
*/
MemcachedDB.prototype.find = function(id, callback) {
  console.log('index::find', arguments.length, arguments);
  if (typeof (id) === 'undefined') {
    return callback(new Error("Please specify a cache key"));
  }

  var self = this;
  this.get(id, function(e, item) {
    callback(e, self.deserialize(item));
  });
};

MemcachedDB.prototype.findById = function(id, callback) {
  this.find(id, callback)
};

MemcachedDB.prototype.findOne = function(id, callback) {
  this.findById(id, callback);
};

// Add or update
MemcachedDB.prototype.save = function onSave(model, data, callback) {
  this.set(data.id, this.serialize(data), 100, callback);
};

// Add or update
MemcachedDB.prototype.create = function onCreate(data, callback) {
  if (typeof (data) === 'undefined' || typeof (data.id) === 'undefined') {
    return callback(new Error("Missing data or record id (key)"));
  }

  this.set(data.id, this.serialize(data), 100, callback);
};

MemcachedDB.prototype.upsert = function onUpsert(model, callback) {
  console.log('index:upsert', arguments);
  this.create(model, callback);
};

// Add or update
MemcachedDB.prototype.updateOrCreate = function onUpdateOrCreate(id, data, callback) {
  console.log('index::updateOrCreate', arguments.length, arguments);
  this.create(data, callback);
};

// Add or update
MemcachedDB.prototype.updateAll = function onUpdateAll(id, data, callback) {
  this.create(data, callback);
};


// Get a count on # of items in cache
MemcachedDB.prototype.count = function onCount(model, callback, where) {
  console.log('index::count');
  this.stats(function(e, res) {
    callback(e, (!e && res && res.length) ? res[0].curr_items : null);
  });
};

MemcachedDB.prototype.destroy = function onDestroy(model, id, callback) {
  this.del(id, callback);
};

// destroy all items
MemcachedDB.prototype.destroyAll = function onDestroyAll(model, data, callback) {
  if (data && data.id) {
    return this.destroy(model, data.id, callback);
  }

  this.flush(callback);
};

MemcachedDB.prototype.deleteById = function onDeleteById(id, callback) {
  this.del(id, callback);
}

function setRemoting(fn, options) {
    options = options || {};
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            fn[opt] = options[opt];
        }
    }
    fn.shared = true;
}


/**
Generate custom routes
that are more inline with
Memcached operations.
*/
MemcachedDB.api = function addRoutes() {
  setRemoting(MemcachedDB.prototype.find, {
    description: 'Locate a cache item by key',
    accepts: [
      {arg: 'key', type: 'String', description: 'Key of cache item to fetch', http: {source: 'query'} }
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/get'}
  });

  setRemoting(MemcachedDB.prototype.create, {
    description: 'Add an item to the cache.',
    accepts: [
      {arg: 'key', type: 'String', description: 'Key of the item to save', http: {source: 'query'} },
      {arg: 'data', type: 'String', description: 'The data to store in cache', http: {source: 'body'} },
      {arg: 'ttl', type: 'Number', description: 'The time to live (TTL) of the data.', http: {source: 'query'} }
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/put'}
  });

  setRemoting(MemcachedDB.prototype.deleteById, {
    description: 'Remove an item from the cache',
    accepts: [
      {arg: 'key', type: 'String', description: 'Key of the item to save', http: {source: 'query'} }
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/del'}
  });

  setRemoting(MemcachedDB.prototype.stats, {
    description: 'Retrieve the status of Memcached',
    accepts: [
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/status'}
  });

  setRemoting(MemcachedDB.prototype.version, {
    description: 'Retrieve the version of Memcached being used',
    accepts: [
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/version'}
  });

  setRemoting(MemcachedDB.prototype.settings, {
    description: 'Retrieve the server settings',
    accepts: [
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/settings'}
  });

  setRemoting(MemcachedDB.prototype.cachedump, {
    description: 'Get a dump of the cache',
    accepts: [
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/cachedump'}
  });
}

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
  connector.DataAccessObject = function() {};

  for (var m in MemcachedDB.prototype) {
    var method = MemcachedDB.prototype[m];
    if ('function' === typeof method) {
      connector.DataAccessObject[m] = method.bind(connector);
      for(var k in method) {
          connector.DataAccessObject[m][k] = method[k];
      }
    }
  }

  if (typeof(fn) === 'function') {
    process.nextTick(fn);
  }
};
