import { MongoClient } from 'mongodb';
import { logger } from '../logger';

const MONGO_CONNECTION_STRING =  process.env.MONGO_CONNECTION_STRING || 'mongodb://127.0.0.1:27017';
const MONGO_CONNECTION_CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
let mongoClient: MongoClient;

export class MongoUtils {
  static async connect () {
    try {
      mongoClient = new MongoClient(MONGO_CONNECTION_STRING, MONGO_CONNECTION_CONFIG);
      await mongoClient.connect();
      logger.info('Successfully connected to MongoDB');
    } catch (error) {
      logger.error('Error while connecting to MongoDB');
    }
  }

  static getClient (): MongoClient {
    return mongoClient;
  }
}