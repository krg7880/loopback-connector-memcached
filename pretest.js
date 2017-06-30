'use strict';

process.env.TEST_MEMCACHED_HOST =
    process.env.TEST_MEMCACHED_HOST || process.env.MEMCACHED_HOST || 'localhost';
process.env.TEST_MEMCACHED_PORT =
    process.env.TEST_MEMCACHED_PORT || process.env.MEMCACHED_PORT || 11211;

var cp = require('child_process');

console.log('seeding DB with example db...');
cp.exec('brew services restart memcached', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error ${error}`);
    return;
  }

  console.log(`stdout ${stdout}`);
  console.log(`stderr ${stderr}`);
});
