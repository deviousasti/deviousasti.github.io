---
title: "A git-config parser"
date: 2019-09-24
description: "A line-by-line parser in F#"
tags: [fsharp, types, dotnet]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

Reading `.git/config` is the fastest way of getting info on a repository and its dependencies. 

## The Spec

Let's start by going through the spec from https://git-scm.com/docs/git-config#_syntax

An example config:

```config
# Core variables
[core]
	; Don't trust file modes
	filemode = false

# Our diff algorithm
[branch "master"]	
	use = true

```

The basics:

> The *#* and *;* characters begin comments to the end of line, blank lines are ignored.

```fsharp
let isComment (line:string) = line.StartsWith(';') || line.StartsWith('#') || String.IsNullOrWhiteSpace(line)
```

> The file consists of sections and variables. A section begins with the name of the section in square brackets and continues until the next section begins.

```fsharp
let isSectionHeader (line:string) = line.StartsWith("[") && line.EndsWith("]")
```

> Sections can be further divided into subsections. To begin a subsection put its name in double quotes, separated by space from the section name, in the section header.

```fsharp
let splitSectionHeader (line:string) = 
    line.Split([|' '|], 2) |> Array.map(fun s -> s.Trim('[',']', ' ', '"'))
```
## Construction

What we want is a seq of `ConfigSection`

```fsharp
type ConfigSection = { Name: string; Subsection: string; Values: Map<string,string> }
```

The file is sequence of lines, but when we encounter a section header, all subsequent lines under it have to be grouped into that section - till the next section header is encountered.

We can do that by carrying the section header with every line until we swap out to a new section header.

```fsharp
Seq.scan (fun (section, prev) line -> 
	if isSectionHeader line then 
		(line, line)                        
	else
		(section, line)
) ("", "")
```

So this is going to be our example up top:

```
("","")
("core", "core")
("core", "filemode = false")
```

Now if we do a `Seq.groupBy fst`, we have our values grouped under our sections.

Here's the whole implementation:

{{< gist deviousasti 48a75b7624ea1c180e3148d63bf3dfae >}}