import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Function to handle offline operations with local storage
async function handleOfflineOperation(method: string, url: string, data: any) {
  // Generate a temporary ID for the new entity
  const tempId = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  // Get the entity type from the URL (e.g., /api/tasks -> tasks)
  const entityType = url.split("/").pop() || "unknown";

  // For create operations (POST)
  if (method === "POST") {
    console.log(`[OFFLINE] Storing ${entityType} in local storage`);

    // Get existing offline items
    const offlineItems = JSON.parse(
      localStorage.getItem(`offline_${entityType}`) || "[]"
    );

    // Add the new item with a temporary ID
    const newItem = {
      ...data,
      id: tempId,
      tempId,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // Save to local storage
    localStorage.setItem(
      `offline_${entityType}`,
      JSON.stringify([...offlineItems, newItem])
    );

    // Return a mock successful response
    return {
      ok: true,
      status: 201,
      json: async () => newItem,
      text: async () => JSON.stringify(newItem),
    } as Response;
  }

  // For other operations (PATCH, DELETE)
  // We could implement these as needed

  throw new Error(`Offline operation not supported for ${method}`);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  try {
    // First check if we're online
    if (!navigator.onLine) {
      console.log(
        `[OFFLINE] Device is offline, using local storage for ${method} ${url}`
      );
      // @ts-ignore - This is a mock implementation for offline mode
      return await handleOfflineOperation(method, url, data);
    }

    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // If the error is a network error, handle it offline
    if (
      error instanceof Error &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("Network Error") ||
        !navigator.onLine)
    ) {
      console.log(
        `[OFFLINE] Network error, using local storage for ${method} ${url}`
      );
      // @ts-ignore - This is a mock implementation for offline mode
      return await handleOfflineOperation(method, url, data);
    }

    // Otherwise, rethrow the error
    throw error;
  }
}

// Modified query function that supports offline mode
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Check if we're offline
      if (!navigator.onLine) {
        const entityType =
          (queryKey[0] as string).split("/").pop() || "unknown";
        const offlineItems = JSON.parse(
          localStorage.getItem(`offline_${entityType}`) || "[]"
        );
        console.log(
          `[OFFLINE] Returning ${offlineItems.length} items from local storage for ${entityType}`
        );
        return offlineItems;
      }

      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const serverData = await res.json();

      // Merge with any offline data
      const entityType = (queryKey[0] as string).split("/").pop() || "unknown";
      const offlineItems = JSON.parse(
        localStorage.getItem(`offline_${entityType}`) || "[]"
      );

      if (offlineItems.length > 0) {
        console.log(
          `[ONLINE] Merging ${offlineItems.length} offline items with server data`
        );
        // For collections, merge server and offline data
        if (Array.isArray(serverData)) {
          return [
            ...serverData,
            ...offlineItems.filter((item: any) => item.pending),
          ];
        }
      }

      return serverData;
    } catch (error) {
      // If offline, return local data
      if (
        !navigator.onLine ||
        (error instanceof Error &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("Network Error")))
      ) {
        const entityType =
          (queryKey[0] as string).split("/").pop() || "unknown";
        const offlineItems = JSON.parse(
          localStorage.getItem(`offline_${entityType}`) || "[]"
        );
        console.log(
          `[OFFLINE] Returning ${offlineItems.length} items from local storage for ${entityType} due to error`
        );
        return offlineItems;
      }

      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
