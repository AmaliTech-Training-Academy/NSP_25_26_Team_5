type SuspenseRecord<T> =
  | {
      status: "pending";
      promise: Promise<void>;
      value?: T;
      error?: unknown;
    }
  | {
      status: "resolved";
      promise?: Promise<void>;
      value: T;
      error?: unknown;
    }
  | {
      status: "rejected";
      promise?: Promise<void>;
      value?: T;
      error: unknown;
    };

const suspenseResourceCache = new Map<string, SuspenseRecord<unknown>>();

// Reads a cached async value and suspends while the loader promise is pending.
export function readSuspenseResource<T>(
  cacheKey: string,
  loader: () => Promise<T>,
): T {
  let record = suspenseResourceCache.get(cacheKey) as SuspenseRecord<T> | undefined;

  if (!record) {
    record = {
      status: "pending",
      promise: loader().then(
        (value) => {
          suspenseResourceCache.set(cacheKey, {
            status: "resolved",
            value,
          });
        },
        (error: unknown) => {
          suspenseResourceCache.set(cacheKey, {
            status: "rejected",
            error,
          });
        },
      ),
    };

    suspenseResourceCache.set(cacheKey, record);
  }

  if (record.status === "pending") {
    throw record.promise;
  }

  if (record.status === "rejected") {
    throw record.error;
  }

  return record.value;
}

export function invalidateSuspenseResource(cacheKey: string) {
  suspenseResourceCache.delete(cacheKey);
}
