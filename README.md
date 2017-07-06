# loopback-connector-memcached

> Memcached loopback.io connector. Please fork and enhance or file a bug ticket if you discover any issues.

### Use cases
- Query Memcached nodes via HTTP
- Uses similar connection as [3rd-Eden/memcached](https://github.com/3rd-Eden/memcached)

## Usage
To effectively use this connector, you need to create 2 files in your models directory:

- /common/models/memcached.json

```json
{
  "name": "memcache",
  "base": "Model"
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
  "memcached": {
    "name": "memcached",
    "connector": "memcached",
    "hosts": [
      "localhost:11211"
    ],
    "options": {
    }
  }
}
```


You can find more options on [Memcached](https://github.com/3rd-Eden/memcached)


### Sample model-config.json
```json
{
    "memcached": {
        "datasource": "memcached",
        "public": false
    }
}
```



## Sample script
- /server/boot/accounts.js

```javascript
module.exports = function(app) {

  var Cache = app.models.memcached;
  var accountModel = app.models.account;
  
  accountModel.find({fields: {id: true}})
  .then(function(results) {
    return Cache.set('accountIds', results, 200);
  })
  .then(function() {
    return Cache.get('accountIds');
  })
  

};
```

## Available API 
#### Some copied from [Memcached](https://github.com/3rd-Eden/memcached)

**ping** Ping the Memcached Server 

* `callback`: **Function**, the callback

```js
app.dataSources.Memcached.ping(function(err, res) {
  console.log(res);
})
```

**flush** Flush the Memcached Server 

* `callback`: **Function**, the callback

```js
app.dataSources.Memcached.connector.flush(function(err, res) {
  console.log(res);
})
```

**disconnect** Disconnect from the Memcached Server 

* `callback`: **Function**, the callback

```js
app.dataSources.Memcached.disconnect(function(err, res) {
  console.log(res);
})
```

**memcached.get** Get the value for the given key.

* `key`: **String**, the key
* `callback`: **Function {Optional}**, the callback .

```js
memcached.get('foo', function (err, data) {
  console.log(data);
});
```

**memcached.getMulti** Retrieves a bunch of values from multiple keys.

* `keys`: **Array**, all the keys that needs to be fetched
* `callback`: **Function {Optional}**, the callback.

```js
memcached.getMulti(['foo', 'bar'], function (err, data) {
  console.log(data.foo);
  console.log(data.bar);
});
```

**memcached.set** Stores a new value in Memcached.

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be stored measured in `seconds`
* `callback`: **Function {Optional}** the callback

```js
memcached.set('foo', 'bar', 10, function (err) { /* stuff */ });
```

**memcached.replace** Replaces the value in memcached.

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`
* `callback`: **Function {Optional}** the callback

```js
memcached.replace('foo', 'bar', 10, function (err) { /* stuff */ });
```

**memcached.add** Add the value, only if it's not in memcached already (will return err if it is).

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`
* `callback`: **Function {Optional}** the callback

```js
memcached.add('foo', 'bar', 10, function (err) { /* stuff */ });
```

**memcached.del** Remove the key from memcached.

* `key`: **String** the name of the key
* `callback`: **Function {Optional}** the callback

```js
memcached.del('foo', function (err) { /* stuff */ });
```