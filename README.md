# loopback-connector-memcached

> Memcached loopback.io connector. Please note this connector is still being developed to work out any kinks or gotchas
> with the supported operations in the context of the cache server, Memcached.

## Why?
Why not? This is was more of a learning exercise to get acclimated to Loopback.io, however, someone may find it useful.
One possible use case is to perhaps query your Memcached nodes via HTTP

## Sample Model JSON (ie: somemodel.json)

- /common/models/somemodel.json
Note that a strict model representation would include the following properties (see below). However, an empty model
works just fine:

```bash
yo loopback:model
>> enter model name (ie: Memcached)
>> quit (no properties required)
```

* id - Key to use for caching item
* data - Data to cache
* ttl - The time to live for the cached item

```json
{
  "name": "cache",
  "plural": "cache",
  "base": "PersistedModel",
  "idInjection": false,
  "properties": {
    "data": {
      "type": "string",
      "required": true
    },
    "ttl": {
      "type": "number",
      "required": false
    }
  },
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": []
}
```

## Sample Model JS (ie: somemodel.js)

- /common/models/somemodel.js

```javascript
module.exports = function(Cache) {
  // Add additional remote methods
  Cache.remoteMethod('<name>', {
    // config
  })
};
```

## Sample datasources.json
```json
{
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "mongodb": {
    "port": 27017,
    "database": "todo-example",
    "name": "mongodb",
    "connector": "mongodb",
    "hostname": "localhost"
  },
  "memcached": {
    "name": "memcached",
    "connector": "memcached",
    "hosts": [
      "localhost:11211"
    ],
    "options": {
      "retries": 10,
      "retry": 10000,
      "remove": true,
      "failOverServers": []
    }
  }
}
```

## Sample boot script (accounts.js) 
- /server/boot/accounts.js
```javascript
module.exports = function(app) {
  var Cache = app.models.Cache;

  // id: cache key
  // data: cache data
  // ttl: cache time to live
  Cache.create({id: 300, data: JSON.stringify({name: 'My Data'}), ttl: 600}, function(e, res) {

    // find item
    Cache.find({id: 300}, function(e, res) {
      console.log('found', e,res);
    });

    // find one -- same as find
    Cache.findOne({id: 300}, function(e, res) {
      console.log('found 2', e,res);
    });

    // get num records
    Cache.count(function(e, res) {
      console.log(arguments);
    });
  });
};
```