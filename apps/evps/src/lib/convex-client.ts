import { ConvexReactClient } from 'convex/react';
import { FunctionReference, OptionalRestArgs } from 'convex/server';
import { ResultAsync } from 'neverthrow';
import { safeConvexCall, EVPSResultAsync } from './result-utils';
import { fromConvexError, createConvexError } from './errors';

// Type-safe Convex client wrapper that returns Results instead of throwing
export class SafeConvexClient {
  constructor(private client: ConvexReactClient) {}

  // Safe query wrapper
  query<Query extends FunctionReference<'query'>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): EVPSResultAsync<Awaited<ReturnType<Query['_returnType']>>> {
    return safeConvexCall(this.client.query(query, ...args) as Promise<any>);
  }

  // Safe mutation wrapper  
  mutation<Mutation extends FunctionReference<'mutation'>>(
    mutation: Mutation,
    ...args: OptionalRestArgs<Mutation>
  ): EVPSResultAsync<Awaited<ReturnType<Mutation['_returnType']>>> {
    return safeConvexCall(this.client.mutation(mutation, ...args) as Promise<any>);
  }

  // Safe action wrapper
  action<Action extends FunctionReference<'action'>>(
    action: Action,
    ...args: OptionalRestArgs<Action>
  ): EVPSResultAsync<Awaited<ReturnType<Action['_returnType']>>> {
    return safeConvexCall(this.client.action(action, ...args) as Promise<any>);
  }
}

// Utility functions for common Convex operations

// Generic list fetcher with filters
export const fetchList = <T, TFilters extends Record<string, unknown>>(
  client: SafeConvexClient,
  listQuery: FunctionReference<'query'>,
  filters?: TFilters
): EVPSResultAsync<T[]> => {
  return client.query(listQuery, filters || {}) as EVPSResultAsync<T[]>;
};

// Generic item fetcher by ID
export const fetchById = <T>(
  client: SafeConvexClient,
  getQuery: FunctionReference<'query'>,
  id: string
): EVPSResultAsync<T | null> => {
  return client.query(getQuery, { id }) as EVPSResultAsync<T | null>;
};

// Generic create operation
export const createItem = <TInput, TOutput>(
  client: SafeConvexClient,
  createMutation: FunctionReference<'mutation'>,
  input: TInput
): EVPSResultAsync<TOutput> => {
  return client.mutation(createMutation, input) as EVPSResultAsync<TOutput>;
};

// Generic update operation
export const updateItem = <TInput, TOutput>(
  client: SafeConvexClient,
  updateMutation: FunctionReference<'mutation'>,
  id: string,
  input: TInput
): EVPSResultAsync<TOutput> => {
  return client.mutation(updateMutation, { id, ...input }) as EVPSResultAsync<TOutput>;
};

// Generic delete operation
export const deleteItem = (
  client: SafeConvexClient,
  deleteMutation: FunctionReference<'mutation'>,
  id: string
): EVPSResultAsync<{ success: boolean }> => {
  return client.mutation(deleteMutation, { id }) as EVPSResultAsync<{ success: boolean }>;
};

// Paginated list fetcher
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

export const fetchPaginated = <T, TFilters extends Record<string, unknown>>(
  client: SafeConvexClient,
  paginatedQuery: FunctionReference<'query'>,
  filters?: TFilters,
  pagination?: PaginationOptions
): EVPSResultAsync<PaginatedResult<T>> => {
  const queryArgs = {
    ...filters,
    ...pagination
  };
  return client.query(paginatedQuery, queryArgs) as EVPSResultAsync<PaginatedResult<T>>;
};

// Batch operations utility
export const batchOperations = <T>(
  operations: EVPSResultAsync<T>[]
): EVPSResultAsync<T[]> => {
  return ResultAsync.combine(operations);
};

// Search utility
export const searchItems = <T, TQuery extends Record<string, unknown>>(
  client: SafeConvexClient,
  searchQuery: FunctionReference<'query'>,
  searchParams: TQuery
): EVPSResultAsync<T[]> => {
  return client.query(searchQuery, searchParams) as EVPSResultAsync<T[]>;
};

// File upload utility (for Convex file storage)
export const uploadFile = (
  client: SafeConvexClient,
  uploadAction: FunctionReference<'action'>,
  file: File,
  metadata?: Record<string, unknown>
): EVPSResultAsync<{ storageId: string; url: string }> => {
  return safeConvexCall(
    (async () => {
      const arrayBuffer = await file.arrayBuffer();
      return client.action(uploadAction, {
        file: arrayBuffer,
        fileName: file.name,
        contentType: file.type,
        metadata
      }) as Promise<{ storageId: string; url: string }>;
    })()
  ).mapErr(fromConvexError);
};

// File download utility
export const downloadFile = (
  client: SafeConvexClient,
  downloadQuery: FunctionReference<'query'>,
  storageId: string
): EVPSResultAsync<string> => {
  return client.query(downloadQuery, { storageId }) as EVPSResultAsync<string>;
};

// Subscription-like utility for reactive queries
// Note: This is a simple polling implementation. For real-time updates,
// you'd want to use Convex's built-in subscription mechanisms
export const watchQuery = <T>(
  client: SafeConvexClient,
  query: FunctionReference<'query'>,
  args: any,
  callback: (result: EVPSResultAsync<T>) => void,
  intervalMs = 1000
): { unsubscribe: () => void } => {
  let isActive = true;
  
  const poll = async () => {
    if (!isActive) return;
    
    const result = client.query(query, args) as EVPSResultAsync<T>;
    callback(result);
    
    setTimeout(poll, intervalMs);
  };
  
  poll();
  
  return {
    unsubscribe: () => {
      isActive = false;
    }
  };
};

// Transaction-like utility for multiple mutations
// Note: Convex doesn't have traditional transactions, but this ensures
// all mutations complete or none do
export const performTransaction = async <T>(
  operations: (() => EVPSResultAsync<unknown>)[]
): EVPSResultAsync<unknown[]> => {
  const results: unknown[] = [];
  
  for (const operation of operations) {
    const result = await operation();
    
    if (result.isErr()) {
      // If any operation fails, return the error
      return ResultAsync.fromSafePromise(Promise.resolve(result)) as EVPSResultAsync<unknown[]>;
    }
    
    results.push(result.value);
  }
  
  return ResultAsync.fromSafePromise(Promise.resolve(results));
};

// Health check utility
export const healthCheck = (
  client: SafeConvexClient,
  healthQuery: FunctionReference<'query'>
): EVPSResultAsync<{ status: 'ok' | 'error'; timestamp: number }> => {
  return client.query(healthQuery, {}).then(result =>
    result.map(data => ({
      status: 'ok' as const,
      timestamp: Date.now(),
      ...data
    }))
  ).orElse(() => 
    ResultAsync.fromSafePromise(Promise.resolve({
      status: 'error' as const,
      timestamp: Date.now()
    }))
  ) as EVPSResultAsync<{ status: 'ok' | 'error'; timestamp: number }>;
};