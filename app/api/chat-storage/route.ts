import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Types
interface ChatThread {
  id: string;
  title: string;
  messages: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface ChatStorage {
  threads: ChatThread[];
  activeThreadId: string | null;
}

// Encryption key - in production, this should be an environment variable
// The key should be 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = process.env.CHAT_ENCRYPTION_KEY;
  if (key && key.length === 64) {
    // If it's a hex string
    return Buffer.from(key, "hex");
  }
  // Generate a deterministic key from a secret (for development)
  // In production, use a proper key management system
  const secret = process.env.GROQ_KEY || "default-secret-key-for-development";
  return crypto.createHash("sha256").update(secret).digest();
}

// Encrypt data
function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Return iv:authTag:encrypted (all hex encoded)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

// Decrypt data
function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

// In-memory storage for development
// In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
const storageCache = new Map<string, ChatStorage>();

// Get user session ID from cookies
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("chat_session_id")?.value;
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = crypto.randomBytes(32).toString("hex");
    // Note: In a real app, you'd set this cookie with proper security attributes
  }
  
  return sessionId;
}

// Get storage for a session
function getStorage(sessionId: string): ChatStorage {
  const stored = storageCache.get(sessionId);
  if (stored) {
    return stored;
  }
  return { threads: [], activeThreadId: null };
}

// Save storage for a session
function saveStorage(sessionId: string, storage: ChatStorage): void {
  // Limit threads to prevent memory issues
  const limitedStorage: ChatStorage = {
    threads: storage.threads.slice(-50),
    activeThreadId: storage.activeThreadId,
  };
  storageCache.set(sessionId, limitedStorage);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const sessionId = await getSessionId();

    switch (action) {
      case "load": {
        const storage = getStorage(sessionId);
        
        // Encrypt the response for security
        const encryptedData = encrypt(JSON.stringify(storage));
        
        return NextResponse.json({
          success: true,
          data: storage, // Return decrypted for client use
          encrypted: encryptedData, // Also provide encrypted version
        });
      }

      case "save": {
        if (!data) {
          return NextResponse.json(
            { success: false, error: "No data provided" },
            { status: 400 }
          );
        }

        // Validate the data structure
        const storageData = data as ChatStorage;
        if (!Array.isArray(storageData.threads)) {
          return NextResponse.json(
            { success: false, error: "Invalid data structure" },
            { status: 400 }
          );
        }

        // Sanitize threads
        const sanitizedStorage: ChatStorage = {
          threads: storageData.threads.map(thread => ({
            id: String(thread.id),
            title: String(thread.title).slice(0, 200),
            messages: Array.isArray(thread.messages) ? thread.messages : [],
            createdAt: String(thread.createdAt),
            updatedAt: String(thread.updatedAt),
          })),
          activeThreadId: storageData.activeThreadId ? String(storageData.activeThreadId) : null,
        };

        saveStorage(sessionId, sanitizedStorage);

        return NextResponse.json({
          success: true,
          data: sanitizedStorage,
        });
      }

      case "clear": {
        storageCache.delete(sessionId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Chat storage API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve storage
export async function GET() {
  try {
    const sessionId = await getSessionId();
    const storage = getStorage(sessionId);

    return NextResponse.json({
      success: true,
      data: storage,
    });
  } catch (error) {
    console.error("Chat storage GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
