---
title: "A better SFV"
date: 2019-08-11
description: "A file integrity checking Powershell module"
tags: [powershell]
featured_image: "/images/powershell.jpg"
categories: automation
---

## File hashes

[SFV][1] used CRC for file checksums - which were fast to compute, but trivial to generate collisions for. We should probably move on to something like **SHA256**.

This is already in PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 
```

## Nicer Outputs

Pipe a list of files, sort by name, hash them and format the output into a table.

```powershell
$Table =
Get-ChildItem -Path $Path |     
Sort-Object -Property Name |
Get-FileHash -Algorithm SHA256 | 
Format-Table @{ Label = 'File'; Expression = { $_.Path | Split-Path -Leaf }}, Hash
```

Running this gives you something like:

```
File		Hash
----		----
Pack1.zip	E25F45F2B360642B8CEACFD7F00796BE355DC720D510343EE4F106BB8EA89D2B
Pack2.zip	FED441E7DC68C4E41F2928A9CD7B393FFCD7A602A28BFC942071109D447D0F1D
Pack4.zip	D4F7BDFC7227601F5677F1E8DBD9E5009FD2BE8A109EDD4F4C8DB175200C4C69
Pages.gz	548EE10D5D59ED535F96C08B2F9999B8866F85C40F0C6BB22DA5A07BD8C035F7
Pages.zip	E65277A391BE9AFCEF046650F23AB0ECB67DE4334C449F21271068239A413F18
```

We can now write this to a file and we have our list of hashes.

## Comparing

Comparing is equally simple - read a saved file and use `Compare-Object` to roughly diff it with a calculated result.

```powershell
Compare-Object ($Table) (Get-Content $Verify)
```

Here's the final powershell module:

{{< gist deviousasti 041d5298adf9a23e7700b7ff5460ce0b>}}

## Usage

Drop it in your PowerShell modules directory in `Verify\Verify.psm1`.

In any folder, use

```powershell
Create-Verification
```

to generate `(current folder).sha2`

The defaults are:

```powershell
Create-Verification -Path . -Filter *.*
```

{{< figure src="/images/powershell-verify1.gif">}}

To verify, use:

```powershell
Create-Verification -Verify (folder.sha2) 
```
`-Path` and `-Filter` options still apply.

{{< figure src="/images/powershell-verify2.gif">}}

Note that the function produces a object stream of `{ Side, File }`, so you can still post-process the output with scripts that handle `Compare-Object` output.

[1]: https://en.wikipedia.org/wiki/Simple_file_verification