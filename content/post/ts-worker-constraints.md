---
title: "Web Workers and Typescript constraints"
date: 2018-10-02
description: "A run-in-another thread implementation, but nicer"
tags: [typescript, web, types]
featured_image: "/images/ts-web-workers.jpg"
categories: dev
comment : false

---

Now there are a million web-worker libraries out there, but what's the harm in having more interesting implementations?

## The Proxy 

The simplest way to start using a worker would be something that can drop in and sub for a regular class with methods and state. 

We can do that by creating a proxy for the class - you call the methods on the proxy - the calls are intercepted and run in the worker, and the results are passed to you as a `Promise`. If the results in the original class were a promise in the first place, you can't return a `Promise<Promise>>` - that would be bad - so we need type unwrapping.

The type function is:

```
Proxy(f(x) -> y) = f(x) -> Promise<y>
Proxy(f(x) -> Promise<y>) = f(x) -> Promise<y>
```

## Building the type function

Let's define what a method is

```
type Method = (...args: any[]) => any;
```

We need to unwrap any promises types:

```
type UnwrapPromise<P> = P extends Promise<infer V> ? V : P;
```

The proxy function:
```
type ProxiedFunction<F extends Method> = 
        (...params: Parameters<F>) => Promise<UnwrapPromise<ReturnType<F>>>;
```

Now let's assemble it  together:

```
export type Proxy<T> = 
{
	[P in keyof T]: T[P] extends Method ?
	ProxiedFunction<T[P]>       
	:
	never
};
```
The type enumerates all members of a given type `T`,
and returns a proxied function for every method.

## Example

To illustrate with an example:

```typescript
class Calc {
    add(x: number, y: number) {
        return x + y;
    }
    async addAsync(x: number, y: number) {
        return x + y;
    }
}
```

We expect the signature of the `add` method on the proxy to be

```typescript
add(x: number, y: number) : Promise<number>
addAsync(x: number, y: number) : Promise<number>
```

And that is exactly what we see:

{{< figure src="/images/ts-web-workers-vscode.jpg">}}

## Implementation

The full  implementation of the web-worker proxy can be found at:

https://github.com/deviousasti/workers.ts