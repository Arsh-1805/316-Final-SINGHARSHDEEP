import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;
let usageCount = 0;

export async function initTestMongo() {
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create({
            instance: { dbName: 'playlister_test', ip: '127.0.0.1' }
        });
        process.env.DB_CONNECT_TEST = mongoServer.getUri();
    }
    usageCount += 1;
    return mongoServer.getUri();
}

export async function shutdownTestMongo() {
    usageCount = Math.max(usageCount - 1, 0);
    if (usageCount === 0 && mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
}
