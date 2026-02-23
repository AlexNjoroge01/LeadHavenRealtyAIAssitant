import { useState, useEffect, useCallback } from "react";

// Types for chat persistence
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string; image?: string }>;
  createdAt: string;
  attachments?: Array<{
    name: string;
    contentType: string;
    url: string;
  }>;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatStorage {
  threads: ChatThread[];
  activeThreadId: string | null;
}

const MAX_THREADS = 50;

// In-memory cache for current session
let memoryCache: ChatStorage = { threads: [], activeThreadId: null };

// Generate a unique ID
function generateId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Server-side API functions
async function fetchFromAPI(action: string, data?: unknown): Promise<ChatStorage> {
  try {
    const response = await fetch("/api/chat-storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from storage API:", error);
    return memoryCache;
  }
}

// Custom hook for chat persistence using server-side storage
export function useChatPersistence() {
  const [storage, setStorage] = useState<ChatStorage>({ threads: [], activeThreadId: null });
  const [isLoading, setIsLoading] = useState(true);

  // Load from server on mount
  useEffect(() => {
    let mounted = true;

    async function loadStorage() {
      try {
        const data = await fetchFromAPI("load");
        if (mounted) {
          setStorage(data);
          memoryCache = data;
        }
      } catch (error) {
        console.error("Failed to load chat storage:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadStorage();

    return () => {
      mounted = false;
    };
  }, []);

  // Save to server
  const saveToServer = useCallback(async (newStorage: ChatStorage) => {
    memoryCache = newStorage;
    setStorage(newStorage);
    
    try {
      await fetchFromAPI("save", newStorage);
    } catch (error) {
      console.error("Failed to save chat storage:", error);
    }
  }, []);

  const createThread = useCallback(async () => {
    const newThread: ChatThread = {
      id: generateId(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newStorage: ChatStorage = {
      threads: [...storage.threads, newThread],
      activeThreadId: newThread.id,
    };

    await saveToServer(newStorage);
    return newThread;
  }, [storage.threads, saveToServer]);

  const selectThread = useCallback(async (threadId: string) => {
    const newStorage: ChatStorage = {
      ...storage,
      activeThreadId: threadId,
    };
    await saveToServer(newStorage);
  }, [storage, saveToServer]);

  const updateThread = useCallback(async (threadId: string, updates: Partial<ChatThread>) => {
    const newStorage: ChatStorage = {
      ...storage,
      threads: storage.threads.map(thread =>
        thread.id === threadId
          ? { ...thread, ...updates, updatedAt: new Date().toISOString() }
          : thread
      ),
    };
    await saveToServer(newStorage);
  }, [storage, saveToServer]);

  const deleteThread = useCallback(async (threadId: string) => {
    const newThreads = storage.threads.filter(t => t.id !== threadId);
    const newStorage: ChatStorage = {
      threads: newThreads,
      activeThreadId: storage.activeThreadId === threadId
        ? newThreads[0]?.id || null
        : storage.activeThreadId,
    };
    await saveToServer(newStorage);
  }, [storage, saveToServer]);

  const addMessageToThread = useCallback(async (threadId: string, message: ChatMessage) => {
    const newStorage: ChatStorage = {
      ...storage,
      threads: storage.threads.map(thread => {
        if (thread.id !== threadId) return thread;

        const newMessages = [...thread.messages, message];
        const title = thread.messages.length === 0
          ? generateThreadTitle(newMessages)
          : thread.title;

        return {
          ...thread,
          messages: newMessages,
          title,
          updatedAt: new Date().toISOString(),
        };
      }),
    };
    await saveToServer(newStorage);
  }, [storage, saveToServer]);

  const clearAllThreads = useCallback(async () => {
    await saveToServer({ threads: [], activeThreadId: null });
  }, [saveToServer]);

  const getActiveThread = useCallback(() => {
    return storage.threads.find(t => t.id === storage.activeThreadId) || null;
  }, [storage]);

  return {
    threads: storage.threads,
    activeThreadId: storage.activeThreadId,
    isLoading,
    createThread,
    selectThread,
    updateThread,
    deleteThread,
    addMessageToThread,
    clearAllThreads,
    getActiveThread,
  };
}

export function createNewThread(): ChatThread {
  return {
    id: generateId(),
    title: "New Conversation",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateThreadTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === "user");
  if (!firstUserMessage) return "New Conversation";

  let content = "";
  if (typeof firstUserMessage.content === "string") {
    content = firstUserMessage.content;
  } else if (Array.isArray(firstUserMessage.content)) {
    const textPart = firstUserMessage.content.find(p => p.type === "text");
    content = textPart?.text || "";
  }

  const title = content.trim().slice(0, 50);
  return title.length < content.trim().length ? `${title}...` : title || "New Conversation";
}
