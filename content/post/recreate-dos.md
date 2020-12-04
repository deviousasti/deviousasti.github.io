---
title: "A DOS-like shell in .Net"
date: 2020-02-18
description: "And a simple tutorial for NetShell"
tags: [types, dotnet]
featured_image: "/images/msdos.jpg"
categories: dev
comment : false
author: Asti
---

## Setup

Add a reference to [NetShell](https://github.com/deviousasti/netshell), create a new `DOS.cs` file. The main file just calls NetShell's `RpcShell` with an instance of `DOS`.

```csharp
static int Main(string[] args)
{
    var shell = new RpcShell(new DOS()) { 
        Prompt = Environment.CurrentDirectory, FlagPrefix = "/" 
    };
    return shell.Run();
}
```

With that out of the way, let's implement the first command.

## echo

This is trivial. Add a `Command` attribute with the (optional) name and help-text.

```csharp
[Command("echo")]
public void Echo(string text) => Console.WriteLine(text);
```
Let's see how that looks like:

{{< figure src="/images/dos-demo1.gif" width="100%" >}}

Maybe add [a bit of colour](/images/dos-demo2.jpg).

```csharp
[Command("echo")]
public void Echo(string text, ConsoleColor color = ConsoleColor.White)
{
	Console.ForegroundColor = color;	
	Console.WriteLine(text);
	Console.ResetColor();
}
```

## cls

`cls` is also trivial to implement.

```csharp
[Command("cls")]
public void Clear() => Console.Clear();
```
## exit

Of course we need an `exit` command - this just calls `Shell.Exit`

```csharp
[Command("exit")]
public void Exit(Shell shell) => shell.Exit(0);
```

## cd

This is as you'd expect, but you also need to change the current shell prompt. We're using the built-in dependency injection to get the instance of the shell, and set the prompt.

```csharp
[Command("cd")]
public void ChangeDir([Suggest(nameof(SuggestDirs))] string directory, Shell shell)
{
    var path = Path.GetFullPath(directory);
    if (!Directory.Exists(path))
        throw new DirectoryNotFoundException($"{path} does not exist");

    shell.Prompt = Environment.CurrentDirectory = path;
}
```
## type

Just return the file contents and it'll be printed out automatically.

```csharp
[Command("type")]
public string Type([Suggest(nameof(SuggestFiles))] string filename) => 
	File.ReadAllText(Path.Combine(Dir, filename));
```
And to auto-complete files in the current directory:

```csharp
public IEnumerable<string> SuggestFiles() => 
	Directory.EnumerateFiles(Dir).Select(Path.GetFileName);
```
## dir

Here we're showing a simple dir command, but here's how to add help-text to the command, and for each pattern.

```csharp
[Command("dir", "Lists directories and files with an optional pattern")]
public IEnumerable<string> List(
	[Description("Accepts glob patterns")] string pattern = "*",
	[Description("Only show files if true")] bool files = false
)
{
	var dirs = files ? Enumerable.Empty<string>() : Directory.EnumerateDirectories(Dir, pattern);
	var allfiles = Directory.EnumerateFiles(Dir, pattern);
	return Enumerable.Concat(dirs, allfiles).Select(Path.GetFileName);
}
```
Now if we do a `help dir` we get:

```
D:\>help dir
Command dir Lists directories and files with an optional pattern
Syntax: dir (String [pattern] = *) (Boolean [files] = False)
/pattern    Accepts glob patterns
/files	    Only show files if true
D:\>
```

## start

Running applications: Anything that doesn't match our commands, we can attempt to run with the given command-line - this is DOS' famous "Bad command or file name". We can do that with the `DefaultCommand` attribute which marks a catch-all method.

The following implementation redirects the `stdin/stdout` of our console to the program, till it's terminated.

```csharp

[DefaultCommand]
public void Execute(string name, string[] args)
{
    using (var process = Process.Start(new ProcessStartInfo(name, String.Join(" ", args)) { RedirectStandardOutput = true, UseShellExecute = false }))
    {
        while (!process.StandardOutput.EndOfStream)
        {
            if (Console.KeyAvailable)
                process.StandardInput.Write(Console.ReadKey().KeyChar);

            if (process.StandardOutput.Peek() != -1)
                Console.Write((char)process.StandardOutput.Read());
        }
    }
}
```

Our demo isn't complete until we run the Windows Command Prompt inside our command prompt!

{{< figure src="/images/dos-demo3.gif">}}