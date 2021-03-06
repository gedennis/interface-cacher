const defaultsDeep = require('lodash.defaultsdeep');
const isUndefined = require('lodash.isundefined');
const Redis = require('ioredis');
Redis.Promise = require('bluebird');

class Cacher {
  /**
   * @param payload
   * @param {Object} [payload.redis] 用于redis的连接
   * @param {string} [payload.redis.host=localhost] host ip of redis
   * @param {number} [payload.redis.port=6379] port of redis
   * @param {number} [payload.redis.db=12] cache db of redis
   * @param {string} [payload.prefix=cache.] key的默认前缀
   * @param {number} [payload.expire=5] key的有效期，单位s
   */
  constructor(payload) {
    const opt = defaultsDeep(payload, {
      redis: {
        host: '127.0.0.1',
        port: '6379',
        db: '12',
      },
      prefix: 'cache.',
      expire: 5,
      raw: false,
    });

    this.client = new Redis(opt.redis);
    this.prefix = opt.prefix;
    this.expire = opt.expire;
  }

  /**
    * 使用redis为接口加缓存
    * @param {Object} payload
    * @param {string} payload.key 要查找的key
    * @param {function} payload.executor 如果未击中，要执行的方法
    * @param {number} payload.expire 失效时间, 单位s
    * @param {boolean} [payload.raw=false] 是否不用 decode/encode 数据
    * @return {Promise.<Object>} 缓存中数据(击中) 或executor返回数据(未击中)
    * @example
    * 说明：以给getShops接口加缓存为例
    * 要点：executor为一个返回bluebird 的promise
    * getShops接口如下：
    * const getShops = (type) => {
    *   if (type === 0) {
    *     return Promise.reject(new Error('bad params'));
    *   }
    *   return Promise.resolve(['shop01', 'shop02']);
    * };
    *
    * 使用方式：
    * const Cacher = require('interface-cacher');

    * const cacher = new Cacher();
    *
    * const payload = {
    *   key: 'getShops',
    *   executor: getShops.bind(null, 1),
    *   expire: 100
    * };
    *
    * cache.get(payload)
    *  .then((data) => {
    *    // process the data
    *  })
    *  .catch((err) => {
    *    // handle the exception when encounter with error
    *  });
    */
  get(payload) {
    const self = this;
    const { key, raw = false } = payload;
    const prefix = this.prefix;
    let expire = payload.expire || this.expire;

    if (expire < 0) {
      expire = this.expire;
    }

    const saveKey = prefix + key;
    return this.client.get(saveKey).then((data) => {
      if (data !== null && data !== 'undefined') {
        return raw ? data : JSON.parse(data);
      }

      return payload.executor().then((result) => {
        if (!isUndefined(result)) {
          const value = raw ? result : JSON.stringify(result);
          self.client.set(saveKey, value, 'ex', expire, 'nx');
        }

        return result;
      });
    });
  }

  /**
   * 删除指定缓存
   * @param {string} key 要删除key
   * @return {Promise.<number>} n 删除的key的数量, 同ioredis.del
   * */
  delete(key) {
    const saveKey = this.prefix + key;
    return this.client.del(saveKey);
  }
}

module.exports = Cacher;
