# loopback-connector-memcached
Loopback connector for Memcached. This is currently work in progress, however, it is functional. Used similar to how built in connectors would be used, however, the API may be different with respect to the operations that the Memcached provides. A operation like findAll would be reasonable in the context of Memcached, for example.


## Sample Model JSON (ie: somemodel.json)

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

## Sample cache.js model
```javascript
module.exports = function(Cache) {
  // enable Memcached CRUD API
  Cache.api();

  var key = "somekey";

  var data = {
    name: "Kirk"
    ,age: 10
    ,state: "New York"
  };

  var ttl = 600;

  Cache.put(key, data, ttl, function(e, res) {
    // do work
  });

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