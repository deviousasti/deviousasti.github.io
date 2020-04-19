---
title: "Datasheet to symbol"
date: 2019-03-05
description: "Go straight from datasheet to symbol as fast as possible"
tags: [altium]
featured_image: "/images/fastsymbol-step3.jpg"
categories: eda
comment : false
---

Don't want to spend 20 minutes copy-pasting bits and pieces of the datasheet into a schematic symbol? This is for you.

### Step 1

Open the datasheet PDF in a word processor. [See image][I1].

T	his is optional, but highly recommended, because PDFs don't have a flowing layout, and it is important that we have flow in this situation. If you're using a web datasheet, you can skip this step. You could also use something like [Tabula][2].

I'll be using the [TPA3137D2][1] (6-W Inductor Free Stereo (BTL) Class-D Audio Amplifier) as an example here.



### Step 2

Copy the pin function table to a spreadsheet.  

{{< figure src="/images/fastsymbol-step2.jpg">}}

Split out the rows for the common pins, and extra numbers for thermal pads:

{{< figure src="/images/fastsymbol-step21.jpg">}}

If you want pin direction, change the IO column to one of `Input`, `Output` or `Power`.

```
=IF(C1 = "I", "Input", IF(C1 = "O", "Output", IF(C1 = "P", "Power", "Passive")))
```

### Step 3

With a schematic library open, open **Tools > Symbol Wizard**
Copy the entire sheet from the spreadsheet, and *Smart Paste* (`Ctrl + Shift + V`) into the Wizard

{{< figure src="/images/fastsymbol-step3.jpg">}}

Select the corresponding column for Display Name, Designator, Electrical Type (optional), and Description

Click `Paste`

Since this is a dual in-line Package (SSOP-28), I will choose the layout style to be dual in-line (see below)

{{< figure src="/images/fastsymbol-step31.jpg">}}

Hit `Place`. And that's it. The final result should look like this:
{{< figure src="/images/fastsymbol-step4.jpg">}}

Each pin should have the correct electrical type and the description.



[1]: http://www.ti.com/lit/ds/symlink/tpa3137d2.pdf
[2]: https://tabula.technology

[I1]: /images/fastsymbol-step1.jpg
[I2]: /images/fastsymbol-step2.jpg

