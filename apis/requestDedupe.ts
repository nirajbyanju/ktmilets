const inflightRequests = new Map<string, Promise<unknown>>();

export const dedupeRequest = <T>(key: string, factory: () => Promise<T>): Promise<T> => {
  const existingRequest = inflightRequests.get(key) as Promise<T> | undefined;
  if (existingRequest) {
    return existingRequest;
  }

  const request = factory().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, request as Promise<unknown>);

  return request;
};
