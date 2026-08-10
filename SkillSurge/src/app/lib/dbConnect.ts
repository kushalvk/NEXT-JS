import mongoose from "mongoose";
import dns from "dns";

/**
 * Node resolves the SRV/TXT records of a `mongodb+srv://` URI with its bundled
 * c-ares resolver, which does not use the operating system's resolver. When
 * c-ares cannot read the adapter configuration it falls back to 127.0.0.1, so
 * on machines where nothing useful answers there - a Windows box with Internet
 * Connection Sharing holding UDP 53, for example - the lookup fails with
 * ECONNREFUSED even though ordinary DNS works everywhere else.
 *
 * Retry once against real resolvers when that happens. Set DNS_SERVERS to
 * override the fallback list (comma separated).
 */
const FALLBACK_DNS_SERVERS = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

function isSrvLookupFailure(error: unknown): boolean {
    // The driver may wrap the DNS error, so walk the cause chain.
    let current = error as { syscall?: string; message?: string; cause?: unknown } | undefined;

    for (let depth = 0; current && depth < 5; depth++) {
        if (current.syscall === "querySrv" || current.syscall === "queryTxt") return true;
        if (typeof current.message === "string" && /query(Srv|Txt)/.test(current.message)) return true;
        current = current.cause as typeof current;
    }

    return false;
}

/**
 * Cache the connection *promise*, not just a flag. Next.js runs route handlers
 * concurrently, so a flag lets a burst of cold requests each call
 * mongoose.connect; awaiting one shared promise opens a single pool. The cache
 * hangs off globalThis so it survives dev-mode hot reloads.
 */
type ConnectionCache = {
    promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { _skillsurgeMongoose?: ConnectionCache };

const cache: ConnectionCache = globalForMongoose._skillsurgeMongoose ?? {promise: null};
globalForMongoose._skillsurgeMongoose = cache;

async function openConnection(): Promise<typeof mongoose> {
    const uri = process.env.MONGODB_URL;
    if (!uri) throw new Error("MONGODB_URL is not defined");

    const options = {
        // Fail fast instead of hanging the request for the 30s default.
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
        minPoolSize: 1,
    };

    try {
        return await mongoose.connect(uri, options);
    } catch (error) {
        if (!isSrvLookupFailure(error) || FALLBACK_DNS_SERVERS.length === 0) throw error;

        console.warn(
            `DNS lookup for the MongoDB SRV record failed via ${dns.getServers().join(", ") || "(no servers)"}; ` +
            `retrying with ${FALLBACK_DNS_SERVERS.join(", ")}`
        );
        dns.setServers(FALLBACK_DNS_SERVERS);
        return mongoose.connect(uri, options);
    }
}

/**
 * Throws on failure rather than killing the process - route handlers turn that
 * into a 500 and the server stays up.
 */
async function dbConnect(): Promise<void> {
    // 1 = connected. Anything else and we (re)await the shared promise.
    if (mongoose.connection.readyState === 1) return;

    if (!cache.promise) {
        cache.promise = openConnection().catch((error) => {
            // Clear the cache so the next request retries instead of reusing a
            // permanently rejected promise.
            cache.promise = null;
            throw error;
        });
    }

    await cache.promise;
}

export default dbConnect;
