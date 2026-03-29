class MockRedis {
    constructor() {
        this.store = new Map();
        console.log('⚠️ Using Mock Redis (In-Memory Storage)');
    }
    async get(key) { return this.store.get(key) || null; }
    async setEx(key, seconds, value) { this.store.set(key, value); setTimeout(() => this.store.delete(key), seconds * 1000); return 'OK'; }
    async del(key) { this.store.delete(key); return 1; }
    async sAdd(key, value) { if (!this.store.has(key)) this.store.set(key, new Set()); this.store.get(key).add(value); return 1; }
    async sRem(key, value) { if (this.store.has(key)) this.store.get(key).delete(value); return 1; }
    async sMembers(key) { if (!this.store.has(key)) return []; return Array.from(this.store.get(key)); }
    async expire(key, seconds) { setTimeout(() => this.store.delete(key), seconds * 1000); return 1; }
    async keys(pattern) { const regex = new RegExp(pattern.replace('*', '.*')); return Array.from(this.store.keys()).filter(k => regex.test(k)); }
    multi() { const self = this; const commands = []; return { setEx: (...args) => { commands.push(() => self.setEx(...args)); return this; }, sAdd: (...args) => { commands.push(() => self.sAdd(...args)); return this; }, expire: (...args) => { commands.push(() => self.expire(...args)); return this; }, del: (...args) => { commands.push(() => self.del(...args)); return this; }, exec: async () => { for (const cmd of commands) await cmd(); return []; } }; }
}

let redisClient = null;
const connectRedis = async () => { redisClient = new MockRedis(); return redisClient; };
const getRedisClient = () => { if (!redisClient) throw new Error('Redis client not initialized'); return redisClient; };
module.exports = { connectRedis, getRedisClient };