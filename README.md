# interface-cacher

[![npm](https://img.shields.io/npm/dt/interface-cacher.svg)](https://www.npmjs.com/package/interface-cacher)
[![Build Status](https://api.travis-ci.org/gedennis/interface-cacher.svg?branch=master&name=dennis)](https://travis-ci.org/gedennis/interface-cacher)
[![Coverage Status](https://coveralls.io/repos/github/gedennis/interface-cacher/badge.svg?branch=master)](https://coveralls.io/github/gedennis/interface-cacher?branch=master) 
[![NPM version](https://img.shields.io/npm/v/interface-cacher.svg?style=flat)](https://www.npmjs.com/package/interface-cacher) [![Greenkeeper badge](https://badges.greenkeeper.io/gedennis/interface-cacher.svg)](https://greenkeeper.io/)

A simple interface cacher based on ioredis.

# JSDoc

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [constructor](#constructor)
-   [get](#get)
-   [delete](#delete)

## constructor

**Parameters**

-   `payload`  
    -   `payload.redis` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 用于redis的连接
        -   `payload.redis.host` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** host ip of redis (optional, default `localhost`)
        -   `payload.redis.port` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** port of redis (optional, default `6379`)
        -   `payload.redis.db` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** cache db of redis (optional, default `12`)
    -   `payload.prefix` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** key的默认前缀 (optional, default `cache.`)
    -   `payload.expire` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** key的有效期，单位s (optional, default `5`)

## get

使用redis为接口加缓存

**Parameters**

-   `payload` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `payload.key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 要查找的key
    -   `payload.executor` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 如果未击中，要执行的方法
    -   `payload.expire` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 失效时间, 单位s
    -   `payload.raw` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 是否不用 decode/encode 数据 (optional, default `false`)

**Examples**

```javascript
说明：以给getShops接口加缓存为例
要点：executor为一个返回bluebird 的promise
getShops接口如下：
const getShops = (type) => {
  if (type === 0) {
    return Promise.reject(new Error('bad params'));
  }
  return Promise.resolve(['shop01', 'shop02']);
};

使用方式：
const Cacher = require('interface-cacher');

const cacher = new Cacher();

const payload = {
  key: 'getShops',
  executor: getShops.bind(null, 1),
  expire: 100
};

cache.get(payload)
 .then((data) => {
   // process the data
 })
 .catch((err) => {
   // handle the exception when encounter with error
 });
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** 缓存中数据(击中) 或executor返回数据(未击中)

## delete

删除指定缓存

**Parameters**

-   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 要删除key

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>** n 删除的key的数量, 同ioredis.del
