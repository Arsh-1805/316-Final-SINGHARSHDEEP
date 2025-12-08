import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import SongStat from '../models/song-stats-model.js';
import StoreController from '../controllers/store-controller.js';
import { initTestMongo, shutdownTestMongo } from './utils/mongo-memory.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const { incrementSongListen, getSongStats } = StoreController;

const createMockResponse = () => {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
};

beforeAll(async () => {
    const uri = await initTestMongo();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    await shutdownTestMongo();
});

beforeEach(async () => {
    await SongStat.deleteMany({});
});

describe('Song stats controller', () => {
    it('increments listens for normalized songs', async () => {
        const basePayload = {
            title: '  Test Song  ',
            artist: 'Integration Artist',
            year: '2024'
        };

        const firstRes = createMockResponse();
        await incrementSongListen({ body: basePayload }, firstRes);
        expect(firstRes.statusCode).toBe(200);
        expect(firstRes.body.listenCount).toBe(1);

        const followupRes = createMockResponse();
        await incrementSongListen(
            {
                body: {
                    title: 'test song',
                    artist: 'integration artist',
                    year: '2024'
                }
            },
            followupRes
        );
        expect(followupRes.statusCode).toBe(200);
        expect(followupRes.body.listenCount).toBe(2);

        const docs = await SongStat.find({});
        expect(docs).toHaveLength(1);
        expect(docs[0].listenCount).toBe(2);
    });

    it('rejects missing song data', async () => {
        const res = createMockResponse();
        await incrementSongListen(
            {
                body: {
                    title: '',
                    artist: 'Integration Artist',
                    year: ''
                }
            },
            res
        );
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errorMessage).toMatch(/missing song data/i);
    });

    it('returns stats sorted by listen count', async () => {
        await SongStat.create([
            { key: 'hit||band||2024', title: 'Hit', artist: 'Band', year: '2024', listenCount: 5 },
            { key: 'chill||band||2022', title: 'Chill', artist: 'Band', year: '2022', listenCount: 2 },
            { key: 'intro||solo||2021', title: 'Intro', artist: 'Solo', year: '2021', listenCount: 1 }
        ]);

        const res = createMockResponse();
        await getSongStats({}, res);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.stats)).toBe(true);
        expect(res.body.stats.map((stat) => stat.listenCount)).toEqual([5, 2, 1]);
    });
});
