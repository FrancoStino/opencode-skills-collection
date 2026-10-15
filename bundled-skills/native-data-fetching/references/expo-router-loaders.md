# Expo Router Data Loaders

Route-level data loading for web apps using Expo SDK 55+. Loaders are async functions exported from route files that load data before the route renders, following the Remix/React Router loader model.

**Dual execution model:**

- **Initial page load (SSR):** The loader runs server-side. Its return value is serialized as JSON and embedded in the HTML response.
- **Client-side navigation:** The browser fetches the loader data from the server via HTTP. The route renders once the data arrives.

You write one function and the framework manages when and how it executes.

## Version boundary

Bind these examples to the installed SDK. The [official loader guide](https://docs.expo.dev/router/web/data-loaders/) distinguishes stable SDK 58+ from experimental SDK 55–57: enable the unstable loader flag only on those earlier versions. Current typed loader imports come from `expo-router/server`. Check rendering configuration and cache behavior for that exact SDK. The historical configurations below illustrate SDK 55–57 and must not be copied unchanged into every newer project.

## Configuration

**Requirements:** Expo SDK 55+, web output mode (`npx expo serve` or `npx expo export --platform web`) set in `app.json` or `app.config.js`.

**Server rendering:**

```json
{
  "expo": {
    "web": {
      "output": "server"
    },
    "plugins": [
      ["expo-router", {
        "unstable_useServerDataLoaders": true,
        "unstable_useServerRendering": true
      }]
    ]
  }
}
```

**Static/SSG:**

```json
{
  "expo": {
    "web": {
      "output": "static"
    },
    "plugins": [
      ["expo-router", {
        "unstable_useServerDataLoaders": true
      }]
    ]
  }
}
```

| | `"server"` | `"static"` |
|---|-----------|------------|
| `unstable_useServerDataLoaders` | Required | Required |
| `unstable_useServerRendering` | Required | Not required |
| Loader runs on | Live server (every request) | Build time (static generation) |
| `request` object | Full access (headers, cookies) | Not available |
| Hosting | Node.js server (EAS Hosting) | Any static host (Netlify, Vercel, S3) |

## Imports

Loaders use two packages:

- **`expo-router`** — `useLoaderData` hook
- **`expo-router/server`** — current `LoaderFunction` type; **`expo-server`** — runtime utilities such as `StatusError` and `setResponseHeaders`. Verify installed exports.

## Basic Loader

For loaders without params, a plain async function works:

```tsx
// app/posts/index.tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export async function loader() {
  const response = await fetch("https://api.example.com/posts");
  if (!response.ok) throw new Error("Posts unavailable");
  const posts = await response.json();
  return { posts };
}

function PostList() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <View>
      {posts.map((post) => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </View>
  );
}

export default function Posts() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <PostList />
    </Suspense>
  );
}
```

`useLoaderData` is typed via `typeof loader` — the generic parameter infers the return type.

## Dynamic Routes

For loaders with params, use the `LoaderFunction<T>` type from `expo-server`. The first argument is the request (an immutable `Request`-like object, or `undefined` in static mode). The second is `params` (`Record<string, string | string[]>`), which contains **path parameters only**. Access individual params with a cast like `params.id as string`. For query parameters, use `new URL(request.url).searchParams`:

```tsx
// app/posts/[id].tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { StatusError } from "expo-server";
import { type LoaderFunction } from "expo-router/server";
import { ActivityIndicator, View, Text } from "react-native";

type Post = {
  id: number;
  title: string;
  body: string;
};

export const loader: LoaderFunction<{ post: Post }> = async (
  request,
  params,
) => {
  if (typeof params.id !== "string" || !params.id) throw new Error("Invalid ID");
  const id = params.id;
  const response = await fetch(`https://api.example.com/posts/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new StatusError(404, `Post ${id} not found`);
  }

  const post: Post = await response.json();
  return { post };
};

function PostContent() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{post.title}</Text>
      <Text>{post.body}</Text>
    </View>
  );
}

export default function PostDetail() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <PostContent />
    </Suspense>
  );
}
```

Catch-all routes access `params.slug` the same way:

```tsx
// app/docs/[...slug].tsx
import { type LoaderFunction } from "expo-router/server";

type Doc = { title: string; content: string };

export const loader: LoaderFunction<{ doc: Doc }> = async (request, params) => {
  const slug = params.slug as string[];
  const path = slug.join("/");
  const doc = await fetchDoc(path);
  return { doc };
};
```

Query parameters are available via the `request` object (server output mode only):

```tsx
// app/search.tsx
import { type LoaderFunction } from "expo-router/server";

export const loader: LoaderFunction<{ results: any[]; query: string }> = async (request) => {
  // Assuming request.url is `/search?q=expo&page=2`
  const url = new URL(request!.url);
  const query = url.searchParams.get("q") ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");

  const results = await fetchSearchResults(query, page);
  return { results, query };
};
```

## Server-Side Secrets & Request Access

Loaders run on the server, so you can access secrets and server-only resources directly:

The following JavaScript is a dependency-injected server handler, not a claim about an installed Expo SDK signature. Wire it into the verified version's loader API. `verifySession` must verify expiry, revocation and identity server-side; cookie presence is insufficient. `authorizeAccount` must bind that identity to the requested account. These project functions are prerequisites, not bundled implementations.

```javascript
export async function loadPrivateBalance(request, {
  verifySession, authorizeAccount, fetchBalance,
}) {
  if (!request) throw new Error("Server request required");
  const session = await verifySession(request);
  if (!session) throw new Error("Unauthenticated");
  const account = await authorizeAccount(session);
  if (!account) throw new Error("Forbidden");
  const balance = await fetchBalance(account);
  return { balance }; // Return only fields this user may view.
}
```

Disable shared caching (`Cache-Control: private, no-store`), protect client caches by identity and clear them on sign-out. Never prerender private account data into static HTML. Verify loader APIs and caching behavior against the installed version and [official data-loader documentation](https://docs.expo.dev/router/web/data-loaders/).

The `request` object is available in server output mode. In static output mode, `request` is always `undefined`.

## Response Utilities

### Setting Response Headers

```tsx
// app/products.tsx
import { setResponseHeaders } from "expo-server";

export async function loader() {
  setResponseHeaders({
    "Cache-Control": "public, max-age=300",
  });

  const products = await fetchProducts();
  return { products };
}
```

### Throwing HTTP Errors

```tsx
// app/products/[id].tsx
import { StatusError } from "expo-server";
import { type LoaderFunction } from "expo-router/server";

export const loader: LoaderFunction<{ product: Product }> = async (request, params) => {
  if (typeof params.id !== "string" || !params.id) throw new Error("Invalid ID");
  const id = params.id;
  const product = await fetchProduct(id);

  if (!product) {
    throw new StatusError(404, "Product not found");
  }

  return { product };
};
```

## Suspense & Error Boundaries

### Loading States with Suspense

`useLoaderData()` suspends during client-side navigation. Push it into a child component and wrap with `<Suspense>`:

```tsx
// app/posts/index.tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export async function loader() {
  const response = await fetch("https://api.example.com/posts");
  if (!response.ok) throw new Error("Posts unavailable");
  return { posts: await response.json() };
}

function PostList() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <View>
      {posts.map((post) => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </View>
  );
}

export default function Posts() {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <PostList />
    </Suspense>
  );
}
```

The `<Suspense>` boundary must be above the component calling `useLoaderData()`. On initial page load the data is already in the HTML, suspension only occurs during client-side navigation.

### Error Boundaries

```tsx
// app/posts/[id].tsx
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Error: {error.message}</Text>
    </View>
  );
}
```

When a loader throws (including `StatusError`), the nearest `ErrorBoundary` catches it.

## Static vs Server Rendering

| | Server (`"server"`) | Static (`"static"`) |
|---|---|---|
| **When loader runs** | Every request (live) | At build time (`npx expo export`) |
| **Data freshness** | Fresh on initial server request | Stale until next build |
| **`request` object** | Full access | Not available |
| **Hosting** | Node.js server (EAS Hosting) | Any static host |
| **Use case** | Personalized/dynamic content | Marketing pages, blogs, docs |

**Choose server** when data changes frequently or content is personalized (cookies, auth, headers).

**Choose static** when content is the same for all users and changes infrequently.

## Best Practices

- Loaders are web-only; use client-side fetching (React Query, fetch) for native
- Loaders cannot be used in `_layout` files — only in route files
- Use the installed SDK’s `LoaderFunction<T>` (currently `expo-router/server`) to type loaders that use params
- The request object is immutable — use optional chaining (`request?.headers`) as it may be `undefined` in static mode
- Return only JSON-serializable values (no `Date`, `Map`, `Set`, class instances, functions)
- Use non-prefixed `process.env` vars for secrets in loaders, not `EXPO_PUBLIC_` (which is embedded in the client bundle)
- Use `StatusError` from `expo-server` for HTTP error responses
- Use `setResponseHeaders` from `expo-server` to set headers
- Export `ErrorBoundary` from route files to handle loader failures gracefully
- Validate and sanitize user input (params, query strings) before using in database queries or API calls
- Handle errors gracefully with try/catch; log server-side for debugging
- SDK 55–57 retain client loader data during navigation. SDK 58+ re-fetches after route unmount/revisit under HTTP cache rules; mounted-route invalidation still needs an explicit design. Verify identity changes and error retries on the installed version.
