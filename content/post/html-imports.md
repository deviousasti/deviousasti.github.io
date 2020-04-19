---
title: "An Html Imports Bundler"
date: 2019-05-06
description: "There's no replacement yet, so might as well make one"
tags: [fsharp, html]
featured_image: "/images/rip-html-imports.jpg"
categories: dev
comment : false
---

Once upon a time HTML imports was marketed at #include for the web and the best thing ever invented.
And it was a great idea.

> HTML Imports is a way to include HTML documents in other HTML documents. You're not limited to markup either. An import can also include CSS, JavaScript, or anything else an .html file can contain. In other words, this makes imports a fantastic tool for loading related HTML/CSS/JS

As with all great ideas, it was just killed off. In Chrome 73, all support will be removed and it will be as it had never existed. Well, at least there was some tool to transform all these imports into a single page with Polymer's [Vulcanize](https://github.com/Polymer/vulcanize).

But.. that was deprecated and moved to [Polymer Bundler](https://github.com/Polymer/polymer-bundler). And then that was moved to Polymer's monorepo with CLI tools. And... it's still broken. And unmaintained.

The original bundler repo had 1k commits and 20k lines of typescript.
Can we just get the most of the functionality with our own bundler in as few lines of code as possible?

## Parsing the Html

There's two candiates. `FSharp.Data` and `HtmlAgilityPack`.
Both are good enough for parsing, but we need to modify the DOM tree and write the output, which  `FSharp.Data` doesn't support.

We'll need the DOM and the source file:

```
type ImportDocument = { document: HtmlDocument; file: string }
```

and to parse:

```fsharp
let scanFile file = 
    try 
       let doc = (createDoc (File.ReadAllText file))
       Some { document = doc; file = file }
    with ex ->
       warnWith (sprintf "Could not parse: %s\n%A" file ex)
       None
```

That's it for parsing an html file.

## Matching our targets

The basic premise is to match an import node

```html
<link rel="import" href="imports.html" />
```

and repeatedly unfold it every time you encounter another import node.
Additionally, we must rewrite `script` and `stylesheet` paths to the new relative path.

We'll write some partial active patterns for those.

```fsharp
let someIf condition value = if condition then Some value else None
let (|Import|_|) node = someIf ((node |> name = "link") && (node |> attr "rel" = "import")) node
let (|Script|_|) node = someIf ((node |> name = "script") && (node |> attr "src" <> "")) node
let (|Style|_|) node  = someIf ((node |> name = "link") && (node |> attr "rel" = "stylesheet")) node
```
## Mapping our paths

There's no good idiomatic way to use `Path` from within F#, so we'll write us a few helpers.

```
    let fullPath = Path.GetFullPath
    let parentDir file = 
        Path.GetDirectoryName(fullPath file)
    let relativeTo file other = 
        Path.Combine((parentDir file), other) |>  fullPath
    let partialRelativeTo root file =
        Path.GetRelativePath((parentDir root), file).Replace("\\", "/")
```

## Unfolding an import

Unfolding is: 

- If it's already imported, avoid

- If it's an import, recursively unfold. 

-  If it's a `script` or `style`, rewrite the path

- If it's none of the above, just include the element unchanged

```fsharp

let unfoldImports source root hasResource = 
    let rec unfold source rel = 
        let importfile = source |> attr "href" |> relativeTo rel
        let relativeToImport rel = rel |> relativeTo importfile |> partialRelativeTo root.file
        let imported = if hasResource importfile then None else scanFile importfile 
        match imported with
        | Some(imported) ->                     
            seq {
                for elem in imported.document |> rootNode |> children do    
                    match elem with
                    | Import(elem) -> yield! unfold elem importfile
                    | Script(elem) -> yield elem |> attrMap "src" relativeToImport
                    | Style(elem)  -> yield elem |> attrMap "href" relativeToImport
                    | _            -> yield elem
            }
        | None -> Seq.empty
          
    unfold source root.file

```

## Injecting our imports

We need to insert each element at the site of the import, however, simple using `importNode.InsertAfter` reverses our import order. A better solution is to repeatedly fold the newly inserted element:

```fsharp
Seq.fold (fun (cur: HtmlNode) elem -> cur.ParentNode.InsertAfter(elem, cur)) source
```
so the entire replace all would be:

```fsharp
let replaceImports doc =    
    let set = new HashSet<_>()
    let add = not << set.Add
    let replaceImport source = 
        unfoldImports source doc add
        |> Seq.fold (fun (cur: HtmlNode) elem -> cur.ParentNode.InsertAfter(elem, cur)) source       
        |> ignore
        source.Remove()            
            
    doc.document
    |> rootNode
    |> descendants "link"
    |> Seq.choose (|Import|_|)
    |> Seq.toArray
    |> Seq.iter replaceImport
```
## Saving the output

There's not much else to do than just load up and file and call `replaceImports` on it:

```fsharp
match scanFile input with
| None -> printfn "Input file was invalid"
| Some (root) -> 
    replaceImports root
    root.document.Save(output)
```
And that's all there is to it.

