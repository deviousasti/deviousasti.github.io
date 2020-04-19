---
title: "The various Schedulers in Rx"
date: 2019-04-19
description: "Does concurrency leak?"
tags: [rx, dotnet]
featured_image: "/images/rx.jpg"
categories: dev
---

## Schedulers in Rx

Schedulers abstract away concurrency from operators.
A scheduler decides what order "thunks" (a unit of work) execute in, and how time *flows*.

There are a number of scheduler implementations for doing work on diverse models of concurrency.
Rx is very preferential to single-threadedness, and opposed to being multi-threaded out of the box.

Most of the time, you don't need to worry about it, and you can go with the reasonable defaults. But very rarely, (and especially if you break the Observable contract), you end up with out-of-order notifications, [deadlocks](http://en.wikipedia.org/wiki/Deadlock), [livelocks](http://en.wikipedia.org/wiki/Deadlock#Livelock) or things lost to the void.

## ImmediateScheduler 

This is the simplest of the lot. It's essentially:

```
Schedule(action) => action()
```

That's why it's... immediate. This is one of the most used schedulers, because there can be context switch, and the more reasonable everything behaves.

## CurrentThreadScheduler 

This is similar to `Immediate with a not-so-subtle difference:

```
Schedule(action, delay) => 
	if (delay > 0 )
		sleep(delay)
		
	if (nothing is running) 
		action() 
		dequeue()
     else 
     	enqueue(action)
```

To be more exact, it will:

- Run a thunk immediately
- If a thunk is scheduled for `t` seconds later, it will sleep for `t` seconds
- If a thunk is already running, it will be added to a queue.

As can be seen from this example:

```cs
CurrentThreadScheduler.Instance.Schedule(() =>
{
	CurrentThreadScheduler.Instance.Schedule(() => Console.WriteLine(1));
    Console.WriteLine(2);
});
```

This prints `2 1`. Using `ImmediateScheduler` here would give you `1 2`.

## EventLoopScheduler

Units of work are scheduled in an event-loop running on a single dedicated thread. Internally, it's a priority queue dispatched by the worker thread. Technically, it's two queues - one for immediate, and one for time-scheduled items.

As with other event loops, this has the strongest guarantee of serialized notifications.
If encounter heisenbugs related to the order of execution, this is the way to go. The caveat is that it's single threaded, so any blocking work locks up the scheduler.

```
Schedule(action, duetime) => 
	if (duetime > 0) 
		time_enqueue(action, duetime)
     else 
		ready_enqueue(action)
```

## NewThreadScheduler

This is conceptually easy to understand - it creates a new thread for every item of work.

```
Schedule(action) => new Thread(action).Start()
```

Threads aren't *that* expensive for modern machines, but why would you need this scheduler?
If you have a really long running work function, on the order of minutes to hours, this is better than locking up a thread in one of the thread pools.

If you happen to pass in an item scheduled in the future though, it creates an `EventLoopScheduler` and uses that.

```
Schedule(action, delay) => new EventLoopScheduler().Schedule(action, delay)
```

## ThreadPoolScheduler

As its name implies. each unit of work is scheduled on the `ThreadPool`.

```
Schedule(action) => ThreadPool.QueueUserWorkItem(action)
```

This is mostly to support platforms where only the thread pool is available - if your platform has support for tasks, (it almost certainly does) - prefer the `TaskPoolScheduler`.

If you are debugging tasks, and want to isolate some portion of your pipeline, this is useful.

## TaskPoolScheduler

Schedules an unit of work on the task pool, using the Tasks API.

```
Schedule(action) => TaskFactory.StartNew(action)
```

This is one of the more optimized schedulers given its frequent use, and as with tasks, prefer it for short units of work.
Still don't arbitrarily use it for everything - `Immediate` is orders of magnitude faster with much less GC.

## DefaultScheduler

This is a platform specific scheduler implementation which calls uses the platform's implementation of `IConcurrencyAbstractionLayer`. The implementation is defined in `System.Reactive.PlatformServices`, which might vary depending on the target. 

For almost all platforms, the abstraction layer in use is based on the `ThreadPool`.
`Scheduler.Default` returns the singleton instance of this.

```
DefaultScheduler Default => DefaultScheduler.Instance;
```

As before, prefer `TaskPoolScheduler`.