---
title: "Create high quality renders of your Altium boards"
date: 2019-02-19
description: "Create realistic renders of PCBs for model shots"
tags: [altium, fusion]
featured_image: "/images/render-altium.jpg"
categories: eda
comment : false
---

## Create a realistic model

Although this should be very straightforward, and while the 3D view in Altium is very accurate, getting it out of there is an entirely different story.

## Step 1

This is, as you'd expect to export a STEP file from Altium.

Use `File > Export > STEP 3D`

{{< figure src="/images/render-altium1.jpg">}}

Remember to export all 3D bodies as well. But you get no traces, silkscreen or pads in a STEP file.

So on to the next step.

## Step 2

Open the STEP file in Fusion 360 (or Keyshot - the process is similar)

{{< figure src="/images/render-altium2.jpg">}}

Make sure the main solids are free from errors, and there's no z-fighting.

## Step 3

In Altium, open `Page Setup` and `Print Properties`.

{{< figure src="/images/render-altium31.jpg">}}

Right click any item and select `Preferences`

{{< figure src="/images/render-altium32.jpg">}}

- Set the Top Paste layer colour to gold, tin
- Set the Top Overlay colour to white
- Set the Top Solder colour to black or a darker colour

Remove the other layers, and set up a composite image in this order:

{{< figure src="/images/render-altium33.jpg">}}

Print as a PDF. Convert to PNG or TIF.

## Step 4

Import the image into Fusion 360 as a decal:

{{< figure src="/images/render-altium4.jpg">}}

Select the top face. Make sure `Chain Faces` is unchecked.

{{< figure src="/images/render-altium41.jpg">}}

Move the decal into position.

## Step 5

Open the Appearance tab, and map more accurate to the existing materials.

You can do this by selecting a material, selecting all instances of it, and dragging a new material.

Here I'm adding a polished gold material for the castellations.

{{< figure src="/images/render-altium51.jpg">}}

Now set up some soft lighting , a solid environment color, and hit Render!

{{< figure src="/images/render-altium5.jpg">}}

And you should have something like this.
