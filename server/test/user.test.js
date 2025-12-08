import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import User from '../models/user-model.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const ensureTestUri = () => {
    const uri = process.env.DB_CONNECT_TEST;
    if (!uri) {
        throw new Error('DB_CONNECT_TEST missing from environment.');
    }
    return uri;
};

beforeAll(async () => {
    const uri = ensureTestUri();
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
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('User model', () => {
    it('creates a user with hashed password', async () => {
        const plainPassword = 'Password123!';
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'user@example.com',
            userName: 'testuser',
            passwordHash: bcrypt.hashSync(plainPassword, 10),
            avatar: 'avatar.png'
        };

        const user = await User.create(userData);

        expect(user._id).toBeDefined();
        expect(user.passwordHash).toBe(userData.passwordHash);
        expect(user.passwordHash).not.toBe(plainPassword);
    });

    it('rejects duplicate email', async () => {
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'duplicate@example.com',
            userName: 'dupuser',
            passwordHash: 'hash',
            avatar: 'avatar.png'
        };
        await User.create(userData);

        await expect(User.create({ ...userData, userName: 'another' })).rejects.toBeTruthy();
    });
});
