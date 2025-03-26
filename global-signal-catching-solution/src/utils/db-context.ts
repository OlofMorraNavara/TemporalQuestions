import { Collection, Db, MongoClient, ObjectId } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "local";

export class DbContext {
  private static client: MongoClient | null = null;

  private static async getClient(): Promise<MongoClient> {
    if (!DbContext.client) {
      DbContext.client = new MongoClient(uri);
      await DbContext.client.connect();
    }
    return DbContext.client;
  }

  private static async getDatabase(): Promise<Db> {
    const client = await DbContext.getClient();
    return client.db(dbName);
  }

  private static async getCollection(
    collectionName: string,
  ): Promise<Collection> {
    const db = await DbContext.getDatabase();
    return db.collection(collectionName);
  }

  static async create(
    collectionName: string,
    documentJson: object,
  ): Promise<string> {
    try {
      const collection = await DbContext.getCollection(collectionName);
      const insertResult = await collection.insertOne(documentJson);
      return insertResult.insertedId.toHexString();
    } catch (error) {
      console.error("Error in DbContext.create:", error);
      throw error;
    }
  }

  static async update(
    collectionName: string,
    id: string,
    documentJson: object,
  ): Promise<any> {
    try {
      const collection = await DbContext.getCollection(collectionName);
      return await collection.updateOne({ _id: new ObjectId(id) }, {
        $set: documentJson,
      });
    } catch (error) {
      console.error("Error in DbContext.update:", error);
      throw error;
    }
  }

  static async read(
    collectionName: string,
    id: string,
  ): Promise<object | null> {
    try {
      const collection = await DbContext.getCollection(collectionName);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error in DbContext.read:", error);
      throw error;
    }
  }

  static async readByProperty(
    collectionName: string,
    propertyValue: any,
  ): Promise<object | null> {
    try {
      const collection = await DbContext.getCollection(collectionName);
      return await collection.findOne({
        $where: function () {
          for (let key in this) {
            if (this[key] === propertyValue) {
              return true;
            }
          }
          return false;
        },
      });
    } catch (error) {
      console.error("Error in DbContext.readByProperty:", error);
      throw error;
    }
  }

  static async readByCriteria(
    collectionName: string,
    criteria: string,
  ): Promise<object[] | null> {
    try {
      const collection = await DbContext.getCollection(collectionName);
      const tokens = criteria.match(/(?:[^\s']+|'[^']*')+/g); // Split by spaces but keep quoted strings
      if (!tokens) return null;

      const query: Record<string, string | number> = {};
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (token.includes("=")) {
          const [key, value] = token.split("=").map((s) =>
            s.trim().replace(/'/g, "")
          );
          query[key] = value;
        }
      }
      return collection.find(query).toArray();
    } catch (error) {
      console.error("Error in DbContext.readByCriteria:", error);
      throw error;
    }
  }

  static async close(): Promise<void> {
    if (DbContext.client) {
      await DbContext.client.close();
      DbContext.client = null;
    }
  }
}
