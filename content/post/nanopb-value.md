---
title: "Decoding a oneof case in nanopb"
date: 2019-08-03
description: "Working around callback limitations"
tags: [cpp, protobuf]
featured_image: "/images/nanopb.jpg"
categories: embedded
---

## Decoding callbacks

Say you have a message type with variable fields:

```protobuf
message KeyValue {
   string key     = 1;
   string value   = 2;
}
```

This generates:

```c
typedef struct _KeyValue {
    pb_callback_t key;
    pb_callback_t value;
} KeyValue;
```

Decoding this in nanopb isn't so bad -

```c
KeyValue decodeKV(char* key, char* value)
{
	KeyValue kv;
	kv.key = readStringCallback(key);
	kv.value = readStringCallback(value);
    return kv;
}
```

Call `pb_decode` and you're done.

## The callback and the union

If your type happens to be inside a `oneof` like so:

```
message Request {
	oneof type {
		Version version = 1;
		KeyValue setting = 2;
	}
}
```

suddenly, the `KeyValue` struct is in an union type - which itself is a field in another struct.

Now when you use `decodeKV` try to decode `Request` (the container message), you will find that nothing happens, and your callbacks are never called. This is because during the decode, the union type itself is initialized and so the `pb_callback`s are set to `NULL` - no callbacks set, no call back (pardon the alliteration).

## If you don't succeed at first, decode again

For this to work out, we need to create an environment where we decode the inner struct as a standalone message - like in our very first scenario.

First we need to figure out which was our `oneof` case - to be more specific, the message descriptor corresponding to our `oneof` case.

We need a type to collect our findings, so:

```c
	typedef struct pb_union_s
	{
		const uint32_t tag;
		const pb_msgdesc_t* submsg_desc;
		pb_istream_t stream;
	} pb_union_t;	
```
I'll put in the full implementation in a gist below, but for now:
```c
	//iterate and decode tag till we get our union desc 
	const pb_union_t getUnionType(uint8_t buffer[], size_t size);
	
	//actually decode our inner message
	bool decodeUnion(void* message, pb_union_t& unionType);
```
and
```c
pb_union_t oneof = getUnionType(packet, packet_size);
```
## Decoding

Now we have our union message type, so - now what?
Now you can check when `oneof.tag` matches `Request_setting_tag` and we have all the information we need to decode `KeyValue`.

```c
KeyValue kv = decodeKV(key, value);
decodeUnion(&kv, oneof);
```

and that's it really.

{{< gist deviousasti ced9041be0c54829a69e9cc18a39f7c4>}}
