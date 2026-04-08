import mongoose from "mongoose";

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || "kawilmart";

const appendDatabaseName = (uri) => {
  const [base, query = ""] = uri.split("?");
  const normalizedBase = base.replace(/\/+$/, "");
  const withDatabaseName = normalizedBase.endsWith(`/${DEFAULT_DB_NAME}`)
    ? normalizedBase
    : `${normalizedBase}/${DEFAULT_DB_NAME}`;

  return query ? `${withDatabaseName}?${query}` : withDatabaseName;
};

const resolveMongoUri = () => {
  const rawUri = process.env.MONGODB_URI?.trim();

  if (!rawUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  try {
    const parsed = new URL(rawUri);

    if (parsed.pathname && parsed.pathname !== "/") {
      return parsed.toString();
    }

    parsed.pathname = `/${DEFAULT_DB_NAME}`;
    return parsed.toString();
  } catch {
    return appendDatabaseName(rawUri);
  }
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    const mongoUri = resolveMongoUri();

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
