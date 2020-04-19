---
title: "Projects"
description: "Stuff I like to work on"
featured_image: "/images/totoro.jpg"
comment : false

---

## Build Bot


https://github.com/deviousasti/build-bot

A zero configuration continuous build system, running as a chatbot.
It can run on a local server or home machine, behind a firewall, and several bot instances can share a single bot account.

{{< figure src="/images/build-bot.jpg">}}

It tracks Git Submodule dependencies and builds whenever there's a change to any of them.

----

## NetShell

https://github.com/deviousasti/netshell

NetShell is a library which lets you create your own bash like shell by mapping methods to commands. It has autocompletion, suggestions, history, dependency injection, supports async and more.

{{< figure src="/images/netshell.gif">}}

It enables building ops tools, allowing you use use refactored code from unit tests.

----

## Stdio Rx

https://github.com/deviousasti/stdio-rx

This a library with versions for both C# and F# which abstracts the standard in, out and error streams of a process as an Observable. You get pushed the program output, subscribing to it starts the process, unsubscribing closes or kills it. And it turns out to be surprisingly powerful abstraction.

----

## OpenSSL Wizard

https://github.com/deviousasti/openssl-wizard

The OpenSSL CLI is  a great tool to generate keys and sign certificates. But its command line arguments are unintuitive and hard to remember. Rather than look up some notes on it, it's much easier to use the wizard which is oriented towards common workflows.

{{< figure src="/images/openssl-wizard.gif">}}

Based on OpenSSL 1.1.1


----

## AT Term

https://github.com/deviousasti/at-term

A modern Hyperterminal. Made specifically for experimenting with AT commands - even now that's the way to communicate with most embedded cellular modules. It support auto-completion, suggestions, file-uploads, logging and a lot more.

{{< figure src="/images/at-term.jpg">}}

----

## CSV Merge

https://github.com/deviousasti/csv-merge

A tool to easily combine bill-of-materials and total up components for purchases. But it's a general purpose merge and consolidate on multiple keys. And it doesn't care about column ordering.

{{< figure src="/images/csv-merge5.gif">}}

The current consolidation defaults are set for Altium's BOMs.

----

## State-machines for F#

https://github.com/deviousasti/FSM

FSM is a minimalist library for functionally defining state-machines in F#. Apart from the implementation of a purely functional automata, it provides a number of combinators for composing states.

----

## Enju for .Net

https://github.com/deviousasti/enju-dotnet

This is a library providing .Net bindings for the [Enju NLP parser](https://github.com/mynlp/enju) from Tsujii laboratory. It features a mapping of Enju's parse tree to a fully indexed object tree, with lazy walks, both to descendants and ancestors.

----

## Typed Workers

https://github.com/deviousasti/workers.ts

A typescript library which provides a proxy interface to any class, hosting an instance of it on a web-worker. 

It proxies method calls to be run in the worker and returns the result as a `Promise`, while being strongly typed the proxy is a transformed type of the provided class.

-----

## LIDR 

https://github.com/deviousasti/lidr

**LIDR is a work in progress.**

LIDR is a tool for generating language-targeted drivers for register-mapped peripherals. LIDR takes as its input a text datasheet.

