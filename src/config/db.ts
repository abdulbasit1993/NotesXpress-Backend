import { MongoClient, Db, MongoClientOptions } from 'mongodb';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect(url: string, dbName: string): Promise<Db> {
    try {
      const options: MongoClientOptions = {};

      this.client = new MongoClient(url, options);

      await this.client.connect();
      this.db = this.client.db(dbName);
      console.log('Database connected successfully');

      return this.db;
    } catch (error) {
      console.error('MongoDB connection error: ', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('Database connection closed');
    }
  }

  isConnected(): boolean {
    return this.db !== null && this.client !== null;
  }

  getClient(): MongoClient | null {
    return this.client;
  }
}

const database = new Database();
export default database;
