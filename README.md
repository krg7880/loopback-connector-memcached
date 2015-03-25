# loopback-connector-memcached

> Memcached loopback.io connector. Please note this connector is still being developed to work out any kinks or gotchas
> with the supported operations in the context of the cache server, Memcached.

## Why?
Why not? This is was more of a learning exercise to get acclimated to Loopback.io, however, someone may find it useful.

### Use cases
- Query Memcached nodes via HTTP
- Common interface (Client.find(), Client.findOne(), etc)

## Usage
To effectively use this connector, you need to create a model with the following properties:

- /common/models/memcached.json

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
    "ip": {
      "type": "string",
      "required": true,
      "id": true,
      "index": true
    },
    "data": {
      "type": "string",
      "required": true
    },
    "ttl": {
      "type": "number",
      "required": false
    }
  },
  "validations": [

  ],
  "relations": {

  },
  "acls": [

  ],
  "methods": [

  ]
}
```

### Sample Model JS (ie: memcached.js)

- /common/models/memcached.js

```javascript
module.exports = function(Cache) {
  // Add additional remote methods
  Cache.remoteMethod('<name>', {
    // config
  })
};
```

### Sample datasources.json
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

  var Model = app.models.Memcached;
  var model = new Model({
    id: <id>,
    data: <data>,
    ttl: <ttl>
  });

  if (model.isValid(function(valid) {
    if (!valid) {
      throw new Error(model.errors[0]);
    }

    Cache.create(model, function(e, res) {

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
  });
};
```