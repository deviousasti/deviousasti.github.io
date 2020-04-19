---
title: "Getting the last value from an Observable when it fails"
date: 2019-05-05
description: "Wait, is that allowed?"
tags: [fsharp, rx, dotnet]
featured_image: "/images/rx.jpg"
categories: dev
---

## The Rx Contract

The Rx contract is:

```
OnNext* (OnError(e)|OnCompleted)+
```

Unfortunately, an `OnError` signals the pipeline to be torn down immediately - throwing away that last, possibly useful result.

## The problem

Let's have a simple source which produces:

```
OnNext(1), OnNext(2), ... OnNext(10), OnError(ex)
```

```csharp
var source = 
    Observable.Range(1, 10).Concat(Observable.Throw<int>(new Exception()));
```
Now if we use an accumulating operator like `Buffer`, or `ToArray` we lose any values accumulated just before the error occured.

```csharp
source
.Buffer(4)
.Subscribe(list => Console.WriteLine(String.Join(",", list)));
```

Before the inevitable error, this prints

```
1,2,3,4
5,6,7,8
```

We're missing the last two values. And if we try

```csharp
source.LastAsync().Subscribe(Console.WriteLine);
```

We get absolutely nothing. 

## How to turn around an error

`Buffer` and `Last`, and `ToArray` would work with the last values, if they got an `OnCompleted` instead. As it turns out, there is an Rx operator which can let us know if there's an`OnError` on the way without tearing down the pipeline.

Enter `Materialize`.

`Materialize` transforms a sequence into a sequence of notifications of the original sequence. And when the sequence has an error, the materialized sequence completes normally - because the error is also materialized.

So now we can transform our earlier example:

```csharp
source
.Materialize()
.Buffer(4)
.Subscribe(list => Console.WriteLine(String.Join(",", list)));
```

And we get:

```
OnNext(1),OnNext(2),OnNext(3),OnNext(4)
OnNext(5),OnNext(6),OnNext(7),OnNext(8)
OnNext(9),OnNext(10),OnError(System.Exception)
```

Much better. We didn't drop anything. If we just want the values, we can clean it up:

```csharp
source
.Materialize()
.Buffer(4)
.Select(list => list.Where(l => l.HasValue).Select(l => l.Value))
.Subscribe(list => Console.WriteLine(String.Join(",", list)));
```

This gives us

```
1,2,3,4
5,6,7,8
9,10
```

The same solution works for `ToArray`.

