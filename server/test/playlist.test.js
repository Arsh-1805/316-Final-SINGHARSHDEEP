import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Playlist from '../models/playlist-model.js';
import { initTestMongo, shutdownTestMongo } from './utils/mongo-memory.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

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
    await Playlist.deleteMany({});
});

describe('Playlist model', () => {
    it('creates a playlist with songs', async () => {
        const playlist = await Playlist.create({
            name: 'Vibes',
            owner: new mongoose.Types.ObjectId(),
            ownerEmail: 'owner@example.com',
            ownerName: 'Owner',
            songs: [
                {
                    title: 'Song',
                    artist: 'Artist',
                    youTubeId: 'youtube123',
                    year: '2020'
                }
            ]
        });

        expect(playlist._id).toBeDefined();
        expect(Array.isArray(playlist.songs)).toBe(true);
        expect(playlist.songs).toHaveLength(1);
    });

    it('fails to create playlist without name', async () => {
        await expect(
            Playlist.create({
                owner: new mongoose.Types.ObjectId(),
                ownerEmail: 'owner@example.com',
                ownerName: 'Owner',
                songs: []
            })
        ).rejects.toBeTruthy();
    });

    it('updates playlist name', async () => {
        const playlist = await Playlist.create({
            name: 'Old Name',
            owner: new mongoose.Types.ObjectId(),
            ownerEmail: 'owner@example.com',
            ownerName: 'Owner',
            songs: []
        });

        playlist.name = 'New Name';
        await playlist.save();

        const updated = await Playlist.findById(playlist._id);
        expect(updated.name).toBe('New Name');
    });

    it('deletes playlist', async () => {
        const playlist = await Playlist.create({
            name: 'To Delete',
            owner: new mongoose.Types.ObjectId(),
            ownerEmail: 'owner@example.com',
            ownerName: 'Owner',
            songs: []
        });

        await Playlist.deleteOne({ _id: playlist._id });
        const found = await Playlist.findById(playlist._id);
        expect(found).toBeNull();
    });
});
