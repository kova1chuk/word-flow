# Suspense Data HOC

This module provides Higher-Order Components (HOCs) and hooks to make any component suspend while data is loading.

## Features

- **Generic Suspense Support** - Works with any data type
- **Promise Caching** - Prevents duplicate requests
- **Error Handling** - Built-in error boundaries
- **Flexible Configuration** - Customizable data validation and fetching logic

## Usage

### 1. Using the Hook Directly

```typescript
import { useSuspenseData } from '@/shared/hooks';

function MyComponent() {
  const data = useSuspenseData({
    data: myData,
    cacheKey: 'unique-cache-key',
    onFetch: () => dispatch(fetchMyData()),
    shouldFetch: !!user,
    hasData: (data) => data && data.length > 0,
  });

  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
}
```

### 2. Using the HOC

```typescript
import { withSuspenseData } from '@/shared/hocs';

// Base component that expects data as a prop
function MyComponentBase({ data }: { data: MyDataType }) {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
}

// Wrapped component that will suspend while loading
const MyComponentWithSuspense = withSuspenseData(MyComponentBase, {
  data: null, // Will be provided by the hook
  cacheKey: 'my-data-cache',
  onFetch: () => dispatch(fetchMyData()),
  shouldFetch: true,
  hasData: (data) => data && data.length > 0,
});
```

### 3. Using the Flexible HOC

```typescript
import { createSuspenseDataHOC } from "@/shared/hocs";

const withMyData = createSuspenseDataHOC<MyDataType>()(
  MyComponentBase,
  (props) => ({
    data: null,
    cacheKey: `my-data-${props.userId}`,
    onFetch: () => dispatch(fetchMyData(props.userId)),
    shouldFetch: !!props.userId,
    hasData: (data) => data && data.length > 0,
  }),
);
```

## API Reference

### `useSuspenseData<T>(options)`

A hook that makes any component suspend while data is loading.

**Options:**

- `data: T | null | undefined` - The data to check
- `isLoading?: boolean` - Loading state (optional)
- `error?: string | null` - Error state (optional)
- `cacheKey: string` - Unique key for promise caching
- `onFetch: () => void` - Function to call when fetching data
- `shouldFetch?: boolean` - Whether to fetch data (default: true)
- `hasData?: (data: T) => boolean` - Function to check if data is valid

**Returns:** `T` - The data when available

### `withSuspenseData<T, P>(WrappedComponent, options)`

A HOC that wraps a component and makes it suspend while data is loading.

**Parameters:**

- `WrappedComponent: React.ComponentType<P>` - Component to wrap
- `options: WithSuspenseDataOptions<T>` - Configuration options

**Returns:** A new component that suspends while loading

### `createSuspenseDataHOC<T>()`

Creates a flexible HOC factory that can be configured with props.

**Returns:** A function that takes a component and options function

## Example: Chart Component

```typescript
// Base component
function ChartComponentBase({ data }: { data: ChartData }) {
  return <Doughnut data={data} />;
}

// With Suspense
const ChartComponentWithSuspense = withSuspenseData(ChartComponentBase, {
  data: null,
  cacheKey: 'chart-data',
  onFetch: () => dispatch(fetchChartData()),
  shouldFetch: true,
  hasData: (data) => data && data.statusCounts.some(count => count > 0),
});

// Usage in parent component
<Suspense fallback={<ChartSkeleton />}>
  <ChartComponentWithSuspense />
</Suspense>
```

## Error Handling

The HOC automatically handles errors by:

1. **Throwing errors** to let Suspense boundaries handle them
2. **Providing error fallbacks** for custom error components
3. **Graceful degradation** when data is unavailable

```typescript
const MyComponentWithErrorHandling = withSuspenseData(MyComponentBase, {
  data: null,
  cacheKey: 'my-data',
  onFetch: () => dispatch(fetchMyData()),
  errorFallback: ({ error }) => <div>Error: {error.message}</div>,
  fallback: <div>Loading...</div>,
});
```
