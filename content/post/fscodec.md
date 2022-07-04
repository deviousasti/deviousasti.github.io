---
title: "Contracts for Event Sourced Systems with FsCodec"
date: 2021-12-18
description: "Safe serialization for contracts"
tags: [fsharp, eventsourcing]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

# Contracts for Event Sourced Systems with FsCodec

[FsCodec](https://github.com/jet/FsCodec/) is an *opinionated* library for working with contracts in event sourced systems in F#. At its core, it's a set of custom JSON serializers for two backends Newtonsoft.Json (NSJ) or System.Text.Json (STJ). 

Normally a higher level system like Propulsion or Equinox will handle this for you - but if you just want contract encoding/decoding, we can directly use `FsCodec` which is plenty high-level. This post details using it in your projects if you don't want to take on additional dependencies.

## Why
Why not just use NSJ or STJ instead? For starters, it doesn't understand F# core types like options, lists, maps et al. If you chose to add custom serializers for those types and made some reasonable choices to get a consistent, version-able output, you'd likely end up with FsCodec.

## Structuring events

This is where the opinionated part is - if you want to structure your events in a resilient fashion, one of the more maintenance-amenable ways is to structure it as a [union contract](https://github.com/eiriktsarpalis/TypeShape/blob/main/src/TypeShape/Applications/UnionContract.fs). Concisely:

- a discriminated union for each event stream 
- each event in the stream is a union case 
- all details of an event is contained in a *single* record type 
- the union is marked with a `IUnionContract` interface

Consider this toy domain model:


```fsharp
module ShoppingCart = 
    type CartAddItem = {
        sku : string
        quantity: int
    }

    type CartRemoveItem = {
        sku : string
    }

    type CartUpdateQuantity = {
        sku : string
        newQuantity : int
    }

    type CartClear = {
        automatic : bool
    }

    type CartCheckout = {
        oneclick : bool
    }

    [<RequireQualifiedAccess>]
    type ShoppingCartEvents =
        | CartAddItem of CartAddItem
        | CartRemoveItem of CartRemoveItem
        | CartUpdateQuantity of CartUpdateQuantity
        | CartClear of CartClear
        | CartCheckout of CartCheckout
            interface IUnionContract

```

Each event is a union case with detail contained in a record type. 

## Encoding/Decoding

With an event DU, you can create a **codec** to encode/decode it.

```fsharp
let codec = Codec.Create<ShoppingCart.ShoppingCartEvents>()
```

If you add more fields in the record in the future, existing applications will ignore those fields. If you add more events in the future, they won't be decoded by the codec and just be ignored.

Now that we have a codec, we can decode events with `TryDecode` and encoding events with `Encode`. 

FsCodec uses two core types as its event abstraction:

- [`IEventData`](https://github.com/jet/FsCodec/blob/master/src/FsCodec/FsCodec.fs#L4) represents a single raw event (and optional metadata) which hasn't been persisted yet
- [`ITimelineEvent`](https://github.com/jet/FsCodec/blob/master/src/FsCodec/FsCodec.fs#L23) inherits from `IEventData` and represents a persisted single event (with optional metadata)

To encode, there's `codec.Encode` - which gets you an `IEventData`.

```fsharp

let event = ShoppingCartEvents.CartAddItem { sku = "ABC10"; quantity = 1 }
let eventData = codec.Encode(None, event)
eventData.Data // {"sku":"ABC10","quantity":1}
eventData.EventType // CartAddItem

```

The event data is serialized separately from the union case. In datastores, you save the event type (union case) out-of-band from the event data. In EventStore, there's `EventType` and with Kafka, you generally have the event type as part of the headers. If you however need it in-band, you can use FsCodec's `Serdes`.

```fsharp
Serdes.Serialize event // {"Case":"CartAddItem","Fields":[{"sku":"ABC10","quantity":1}]}
```

To decode, FsCodec expects a `ITimelineEvent`. For example, to decode an event from [EventStoreDB](https://www.eventstore.com), we can take the `ResolvedEvent` type from the EventStore client and create a `ITimelineEvent` :

```fsharp
let toTimelineEvent (resolvedEvent: ResolvedEvent) =
    let evt = resolvedEvent.Event
    TimelineEvent.Create(
        index = evt.EventNumber,
        eventType = evt.EventType,
        data = evt.Data,
        meta = evt.Metadata,
        eventId = evt.EventId,
        timestamp =  DateTimeOffset evt.Created)
```

and

```fsharp
resolvedEvent |> toTimelineEvent |> codec.TryDecode // ShoppingCartEvents option
```

It's up to your implementation to decide whether you ignore un-decodable events or do something else like log them.

## Differing Contracts

While these are great for schemas we fully own, with external systems we may not be so lucky.  Sometimes, the message contract may be completely different from the inputs to our ACL. 

In a case where a single field in the message serves as the discriminator tag, we can use an [`UnionConverter`](https://github.com/jet/FsCodec/blob/master/src/FsCodec.NewtonsoftJson/UnionConverter.fs). It flattens the event data and label (this is customizable) into a single JSON object.

```fsharp
Serialize (Greet { message = "hi"}) // {"case":"Greet","message":"hi"}
```

However, when the message contract diverges too far from our internal representation (a level usually behind the domain model), we need an escape hatch.

That escape hatch presents itself in the form of `JsonIsomorphism`.

An Isomorphism is defined as a reversible mapping between two types, `f : T -> U` and `g : U -> T` such that ` f.g` and  `g.f` is equal to `id`.

```fsharp
type JsonIsomorphism<'T,'U> =
  ...
  abstract Pickle: 'T -> 'U 
  abstract UnPickle: 'U -> 'T
```

`Pickle` is converting to the contract type and `Unpickle` is converting from the target type.

For example, consider the type:

```fsharp
type ConveyorAssociation =
| ConveyorId of string
| NoAssociation
```

which is used in a contract type

```fsharp
{ ...
  association : ConveyorAssociation option }
```

but the actual JSON message contains one of:

- `"association" : "NONE"` which maps to `Some ConveyorAssociation.NoAssociation`
- `"association" : "ABC123"` which maps to `Some (ConveyorAssociation.ConveyorId "ABC123")`
- `"association" : null` which maps to `None`

This type of contract is fairly arbitrary and messy, using the string `"None"` as a sentinel value. 

The solution is to introduce  an isomorphism between `ConveyorAssociation option` <=> `string option`:

```fsharp
type ConveyorConverter() =
     inherit JsonIsomorphism<ConveyorAssociation option, string option>()
     override _.Pickle v =
         v |> Option.map(function
             | NoAssociation -> "NONE"
             | ConveyorId id -> id)
 
     override _.UnPickle s = 
         s |> Option.map(function             
			| "NONE" -> NoAssociation
             | id -> ConveyorId id)
```

and annotating the record field with:

```fsharp
{ ...
  [<JsonConverter(typeof<ConveyorConverter>)>]
  association : ConveyorAssociation option }
```

which now works like we expect it to.

## Enumerations

If a particular value is best represented by an enumeration, it's better to use a DU instead of an .NET Enum. Enums in either serialization library can take more than the defined range of values.
However, a DU will be serialized with a case label. If the DU will never have any attached fields, 
we can use a `TypeSafeEnumConverter`.

```fsharp
[<JsonConverter(typeof<TypeSafeEnumConverter>)>]
type FileSource = 
    | HTTPS 
    | HTTP 
    | FTP 
    | SFTP

type FileUploaded = { 
    filename: string
    size: int64
    source: FileSource
}

let event = 
    { filename = "test.xls"; size = 10000L; source = SFTP }    

Serdes.Serialize event // {"filename":"test.xls","size":10000,"source":"SFTP"}
```
Deserializng parses it out to a DU case, however missing DU cases will thrown an exception, so it's difficult to version. For more flexibility, we can use an isomorphism.

```fsharp
type TypeSafeEnumConverterWithFallback<'T>(fallback : string) =
    inherit JsonIsomorphism<'T, string>()
    let fallback = TypeSafeEnum.parse fallback
    override _.Pickle v = TypeSafeEnum.toString v
    override _.UnPickle s = s |> TypeSafeEnum.tryParse |> Option.defaultValue fallback
```

and

```fsharp
    ...
    [<JsonConverter(typeof<TypeSafeEnumConverter>, (nameof HTTP))>]
    source: FileSource
```

This gives us much more flexibility to add cases in the future and work safely with existing applications. 

## Further reading

Versioning events is a non-trivial problem, and is not under the scope of this post.

- [A Contract Pattern for Schemaless DataStores](http://eiriktsarpalis.wordpress.com/2018/10/30/a-contract-pattern-for-schemaless-datastores/) by Eirik Tsarpalis.
- The [FsCodec Readme](https://github.com/jet/FsCodec/blob/master/README.md)
- [Serialization strategy for Event Sourcing](https://blog.softwaremill.com/the-best-serialization-strategy-for-event-sourcing-9321c299632b) by Software Mill

