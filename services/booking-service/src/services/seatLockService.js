const { getRedisClient } = require('../config/redis');

class SeatLockService {
    constructor() { this.HOLD_TIME = parseInt(process.env.BOOKING_HOLD_TIME) || 180; }
    getSeatKey(showId, seatId) { return `seat:lock:${showId}:${seatId}`; }
    getUserHoldsKey(userId) { return `user:holds:${userId}`; }

    async lockSeats(showId, userId, seats) {
        const redis = getRedisClient();
        const lockedSeats = [], failedSeats = [];
        for (const seat of seats) {
            const seatKey = this.getSeatKey(showId, seat.seatId);
            const existingLock = await redis.get(seatKey);
            if (existingLock) { failedSeats.push(seat); continue; }
            const lockData = JSON.stringify({ userId, seat, lockedAt: new Date().toISOString() });
            await redis.setEx(seatKey, this.HOLD_TIME, lockData);
            await redis.sAdd(this.getUserHoldsKey(userId), seat.seatId);
            await redis.expire(this.getUserHoldsKey(userId), this.HOLD_TIME);
            lockedSeats.push(seat);
        }
        return { success: failedSeats.length === 0, lockedSeats, failedSeats, message: failedSeats.length > 0 ? `${failedSeats.length} seats are already booked or on hold` : 'All seats locked successfully' };
    }

    async checkSeatsAvailability(showId, seats) {
        const redis = getRedisClient();
        const availableSeats = [], unavailableSeats = [];
        for (const seat of seats) {
            const lock = await redis.get(this.getSeatKey(showId, seat.seatId));
            if (!lock) availableSeats.push(seat);
            else unavailableSeats.push(seat);
        }
        return { available: unavailableSeats.length === 0, availableSeats, unavailableSeats };
    }

    async confirmSeats(showId, userId, seats) {
        const redis = getRedisClient();
        for (const seat of seats) {
            const seatKey = this.getSeatKey(showId, seat.seatId);
            const lockData = await redis.get(seatKey);
            if (lockData) {
                const parsed = JSON.parse(lockData);
                if (parsed.userId === userId) {
                    await redis.setEx(seatKey, 3600, JSON.stringify({ ...parsed, confirmed: true, confirmedAt: new Date().toISOString() }));
                    await redis.sRem(this.getUserHoldsKey(userId), seat.seatId);
                }
            }
        }
    }

    async releaseSeats(showId, userId, seats) {
        const redis = getRedisClient();
        for (const seat of seats) {
            const seatKey = this.getSeatKey(showId, seat.seatId);
            const lockData = await redis.get(seatKey);
            if (lockData) {
                const parsed = JSON.parse(lockData);
                if (parsed.userId === userId) {
                    await redis.del(seatKey);
                    await redis.sRem(this.getUserHoldsKey(userId), seat.seatId);
                }
            }
        }
    }

    async getHeldSeats(showId) {
        const redis = getRedisClient();
        const keys = await redis.keys(`seat:lock:${showId}:*`);
        const heldSeats = [];
        for (const key of keys) {
            const data = await redis.get(key);
            if (data) heldSeats.push({ seatId: key.split(':').pop(), ...JSON.parse(data) });
        }
        return heldSeats;
    }
}

module.exports = new SeatLockService();