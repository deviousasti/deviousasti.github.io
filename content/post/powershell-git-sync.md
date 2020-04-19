---
title: "Sync git modules to .gitmodules"
date: 2019-06-17
description: "And a tale of git in Powershell"
tags: [git, powershell]
featured_image: "/images/powershell.jpg"
categories: automation
author: asti
---

## .gitmodules is not git submodules

A  `.gitmodules` file is sort of indicative - it's not what actually is being tracked by Git.
When you start a new project, and you have to include a bunch of submodules, you may think of starting off by copying and editing a `.gitmodules` file with all the submodules you want, but that literally does nothing.

You'll find out that you have to `git submodule add` everything by hand.
Well, we could just automate that.

## Reading .gitmodules

Git has some commands to help us read `.gitmodules`.
It's behind `git config --file`.

Let's get all the keys first.

```
git config --file .gitmodules --list
```

That was easy.  We got a list of keys.
And to get a value for a specific key:

```powershell
function lookup($key, $defaultValue = "") {        
	$value = git config --file $gitmodules --get "$key" 2>&1 
	if($LASTEXITCODE -ne 0) { $defaultValue } else { $value }
}
```

## Extracting submodules

We just get a list of the unique submodules, and lookup the keys for `path`, `url` and `branch` (if it exists).

```powershell
all | 
foreach { $_ -split "\."  | select -Index 1 } | 
select -Unique |
foreach {[pscustomobject]@{ 
	Path = lookup "submodule.$_.path"; 
	Url = lookup "submodule.$_.url";  
	Branch = lookup "submodule.$_.branch" "master";
}} 
```

That gives us something like this:

```
Path               Url                                                      Branch  
----               ---                                                      ------  
stm32-core         https://git.webyfy.com/webyfylabs/core-STM32.git         STM32F03
src/rtt            https://git.webyfy.com/webyfylabs/rtt.git                master  
src/node           https://git.webyfy.com/webyfylabs/node-core.git          master  
src/sens           https://git.webyfy.com/webyfylabs/sens-core.git          master  
rtt                https://git.webyfy.com/webyfylabs/rtt.git                master  
```

Pretty neat.

## std from PowerShell

While all that remains is call `git submodule add` with the parameters we just found, you will quickly run into a problem:

```
git : Cloning into 'D:/Experiments/Subtest/src/rtt'...
At D:\Experiments\Subtest\SyncSubmodules.ps1:29 char:9
+         git submodule add $sub.Url $sub.Path
+         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Cloning into 'D...est/src/rtt'...:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
```

There is actually no error here - PowerShell thinks that any output in `stderr` is *due* to an error.
Even if we redirect `stderr`, the `stderr` stream will end up propagating downstream. In order to avoid this, we redirect then reproject every element to an `stdout`  stream.

 ```
 2>&1 | foreach { "$_" }
 ```

 So our add becomes:
 ```
 git submodule add $sub.Url $sub.Path 2>&1 | foreach { "$_" }
 ```

 Now that we all that pieces, we can make the module.

{{< gist deviousasti b23160ef21d16faa3b8668ae11a20ed2>}}

 ## Usage:
cd to path with `.gitmodules`
```
Sync-Submodules
```