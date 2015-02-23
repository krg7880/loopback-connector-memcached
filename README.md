# loopback-connector-memcached

> Memcached loopback.io connector. Please note this connector is still being developed to work out any kinks or gotchas with the supported operations in the context of the cache server, Memcached. 

StrongLoop Labs projects provide early access to advanced or experimental functionality.  In general, these projects may lack usability, completeness, documentation, and robustness, and may be outdated.
However, StrongLoop supports these projects: Paying customers can open issues using the StrongLoop customer support system (Zendesk), and community users can report bugs on GitHub.

**NOTE: THIS MODULE IS PRE-RELEASE**

Loopback connector for Memcached. This is currently work in progress, however, it is functional. Used similar to how built in connectors would be used, however, the API may be different with respect to the operations that the Memcached provides. A operation like findAll would be reasonable in the context of Memcached, for example.


## Sample Model JSON (ie: somemodel.json)

- /common/models/somemodel.json

```json
{
  "name": "cache",
  "plural": "cache",
  "base": "PersistedModel",
  "idInjection": false,
  "properties": {
    "key": {
      "type": "string",
      "required": true
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