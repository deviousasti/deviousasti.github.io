---
title: "Combine your Bill of Materials"
date: 2018-11-02
description: "Figure out which parts are in common, and how many to order"
tags: [tools, altium]
featured_image: "/images/bom-merge.jpg"
categories: eda
comment : false
---

Sometimes, you have a small run of boards, and you need to combine the BOM for them, to know how much to order or check against your inventory. This is especially needed when a lot of designs share parts, and it is tedious to combine them by hand.

Get [csv-merge][1]

## Step 1

Export your BOM files as CSV (Comma Separated Values).

Check if most of your BOMs have the same header - the order does not matter, just the name.

## Step 2

Drag and drop your BOM files onto the window. You can also drag folders onto it - they will be searched recursively for all `csv` files.

{{< figure src="/images/csv-merge1.gif">}}

You can remove any files you don't want by selecting it, and [hitting delete][2].



You can drag folders or files onto the window again to bring in new files, or ones you've removed.

No duplicates will be added.

## Step 3

Whichever entry you select will be the one that's used for.

{{< figure src="/images/csv-merge3.gif">}}

Click merge when you're done.

{{< figure src="/images/csv-merge4.jpg">}}

All of the rows in these sheets are appended one after another, irrespective or column ordering.

The first column will be the file name of where these rows were taken from.

## Step 4

Choose a set of keys - these are what identifies a component uniquely.

Usually, the value column does that. In case the values are not descriptive enough, check Footprint as well.

That way, `10k 1%, 0805` will be how a part is declared unique.

You can set the `Quantity` column to Total. This will cause the values in each cell to be summed up.

Usually, this is already done using reasonable defaults.

{{< figure src="/images/csv-merge5.gif">}}

When you're done, hit Consolidate.

{{< figure src="/images/csv-merge6.jpg">}}

The first column will be a list of which sheets the parts were taken from.

The designators column has been joined with `;`.

The quantity has been summed - leaving us with the total number of parts.

[1]: https://github.com/deviousasti/csv-merge
[2]: /images/csv-merge2.gif