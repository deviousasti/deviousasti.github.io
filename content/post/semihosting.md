---
title: "How to get rid of Semihosting"
date: 2019-10-12
description: "Most guides tell you how to set up ARM Semihosting. This is about how to get rid of it."
tags: [arm, assembly, cpp]
featured_image: "/images/semihosting.jpg"
categories: embedded
comment : false
---

...*or* why my application stops when disconnected from the debugger.

As you can tell from the image, I've been bitten badly by semihosting before.

## What is ARM Semihosting?

Semihosting is a mechanism that enables code running on an ARM target to communicate and use the Input/Output facilities on a host computer running a debugger.

To put it simply, it lets you use `printf`, `scanf` and other syscalls on a target where the host acts as the 'system' in those calls. ARM Semihosting can be useful when other avenues of troubleshooting are difficult. 

## Why is it a pain

The culprit:
```assembly
BKPT 0xAB
```


ARM processors use the `BKPT`instruction on the Cortex M0, M0+, M1, M3, M4. M7 and on others the `SVC` instruction (previously `SWI`). Now the implementation of `BKPT` is - when the instruction is encountered, the CPU halts and waits for the host to respond. 

When the host does not support semihosting, or there is no debugger connected - that's the end of the line.

## How to remove Semihosting

You may not be intentionally using Semihosting, but your toolchain might be building with Semihosting. Here's what to look for:

- Linker flags should be `--specs=nosys.specs` and not `–specs=rdimon.specs`
	
	nosys = no POSIX calls, so if your build fails you've got some work left. If you were already building with `nosys`, and this doesn't help, read on.
- Compile this (not for ARM, for x86!), and replace `g++` or `ld` with it.	
    ```c++
    #include <iostream> 
    using namespace std; 

    int main(int argc, char** argv) 
    { 
        for (int i = 0; i < argc; ++i) 
            cout << argv[i] << " "; 

        return 0; 
    } 
    ```
    Your build script may be responsible.
    Replacing the compiler with this dummy executable which just prints out the input arguments is helpful in troubleshooting it.
	Make sure that at no point is `rdimon.specs` ever mentioned

- Check your source for a call to `initialise_monitor_handles` (check your startup files as well) - this is specifically for trigering [RDI][1]
- Implement dummy versions of 
	```c
	int _write(int file, char *ptr, int len);
	int _write_r(struct _reent *r, int file, const void *ptr, size_t len);
  ```
- Check stacktraces for any call using `printf` with semihosting disabled (this should trigger a trap)
- If using VisualGDB, install the Advanced Semihosting and Profiler framework and select 'ignore semihosting calls' 
- Check dissasembly of syscalls (`_write, _system, _start...`)

	{{< figure src="/images/disas1.jpg">}}
	{{< figure src="/images/disas2.jpg">}}
	
	Track down the sources of the syscalls. Try replacing *libc* or *newlib* with another copy.
- Trust nothing. Not even the the [C runtime][3]. Versions of `crt0.s` with `BKPT` in them have been shipped. 
	
	Replace `cortex_m*/crt0.o` in your toolchain with one from another version of the toolchain or from another vendor's. It shouldn't matter. 

- Disassemble and repeat until you find the call responsible
- If all else fails, toss everything in the fire and start over

[1]: http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.faqs/ka8256.html
[3]: https://en.wikipedia.org/wiki/Crt0