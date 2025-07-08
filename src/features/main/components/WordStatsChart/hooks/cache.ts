interface DataResource<T> {
  read(): T;
}

interface PendingResource {
  status: "pending";
  promise: Promise<unknown>;
}

interface SuccessResource<T> {
  status: "success";
  data: T;
}

interface ErrorResource {
  status: "error";
  error: Error;
}

type Resource<T> = PendingResource | SuccessResource<T> | ErrorResource;

const cache = new Map<string, Resource<unknown>>();

export function createDataResource<T>(
  key: string,
  fetcher: () => Promise<T>
): DataResource<T> {
  let resource = cache.get(key);

  if (!resource) {
    const promise = fetcher().then(
      (data) => {
        cache.set(key, { status: "success", data });
      },
      (error) => {
        cache.set(key, { status: "error", error });
      }
    );

    resource = { status: "pending", promise };
    cache.set(key, resource);
  }

  return {
    read() {
      switch (resource!.status) {
        case "pending":
          throw resource.promise;
        case "error":
          throw resource.error;
        case "success":
          return resource.data as T;
      }
    },
  };
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
