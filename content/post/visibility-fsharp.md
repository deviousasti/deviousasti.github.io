---
title: "Visibility in F#"
date: 2019-02-22
description: "How does F# map visibility levels to the assembly"
tags: [fsharp, types, dotnet]
featured_image: "/images/fsharp-visibility.jpg"
categories: dev
comment : false
---

## let vs. member assignments

What's the difference between writing `let` in a type vs. writing `member`?

For starters, there's not a huge difference. 

```fsharp
type Test () =
    let mutable lastTime = DateTime.MinValue
```
is equivalent to:

```csharp
public class Test
{
	internal DateTime lastTime = DateTime.MinValue;
}
```

`let mutable` resolves to an internal field.

As you may already know,
```fsharp
type Test () =
    let firstTime = DateTime.MinValue
```
always stays in the scope of the constructor, unless referenced outside.
Equivalent to:

```csharp
	public class Test
	{
		public Test()
		{
			var firstTime = DateTime.MinValue;
		}
	}
```
Referencing it in a member lifts it to be a field.

```fsharp
type Test () =
    let firstTime = DateTime.MinValue
    member this.getFirst() = firstTime
```
is equivalent to:
```csharp
public class Test
{
	internal DateTime firstTime = DateTime.MinValue;
	public DateTime getFirst() => firstTime;
}
```

## let vs. member functions

For functions, the behavior is similar, except using `member` makes it public by default.

```fsharp
let getFirst() = firstTime
```

becomes 

```csharp
internal DateTime getFirst() => firstTime;
```
and 

```fsharp
member this.getFirst() = firstTime
```
becomes 

```csharp
public DateTime getFirst() => firstTime;
```

Using `member private` changes visibility back to `internal` (not `private`).

These two statements are generated IL-wise, identical:

```fsharp
let firstTime = DateTime.MinValue
member private this.firstTime = DateTime.MinValue
```

## There is no protected 

If you have a protected virtual method, the IL method attributes would be:

	PrivateScope, Family, Virtual, HideBySig

F# has no concept of `family` or `protected`. The CLI compiled form of all non-public entities is *internal*. 

If you override a member which was `protecte`, it becomes `public`.

In the F# 4.1 Spec, section 10.5:

> ### Accessibility Annotations 
> 
> The table lists the accessibilities that can appear in user code:
> 
> **public**
> 
> No restrictions on access. 
> 
> **private** 
> 
> Access is permitted only from the enclosing type, module, or namespace
> declaration group. 
> 
> **internal**   
> 
> Access is permitted only from within the enclosing assembly, or from assemblies whose name is listed using the
> InternalsVisibleTo attribute in the current assembly.
> 
> ...
> 
> **Note:** The family and protected specifications are not supported in this version of the F# language.


## member or let?

For using F# in an idiomatic way, `let` is the way to go.
If cross-language compatibility is important to you, use `member`.

`member` also lets you use functions out of order, if that is important to you.

```fsharp
type Test () =
    let mutable firstTime = DateTime.MinValue
    member this.isValidDate () = 
    	this.getFirst() <> DateTime.MinValue //getFirst isn't declared yet
    member this.getFirst() = firstTime
```



