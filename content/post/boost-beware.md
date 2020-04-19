---
title: "Boost beware"
date: 2019-12-21
description: "Be careful while designing boost converters"
tags: [circuits]
featured_image: "/images/explosion.jfif"
categories: eda
comment : false
---

There are a lot of new small-form factor, low part count boost converters being released for battery boost applications. These typically switch at high frequencies to reduce component sizes.

## The Symptoms

- Devices sometimes brownout with no pattern
- [Heisenbugs](https://en.wikipedia.org/wiki/Heisenbug)
- Weird disconnections and readings

## Possible Causes

- Long path between output caps and output pin - these could act as parasitic inductances, causing output spikes when load changes	

- High impedance path between IC ground and output ground - this should be obvious, but is most often overlooked because of layout constraints

- Input voltage passes through the main inductor before being switched - which means that for long input traces - such as long wires from the battery may lead to loop instability if enough input capacitance is not present.

  Quoting  TI datasheet:

    > When a ceramic capacitor is used at the input and the power is being supplied through long wires, a load step at the output can induce ringing at the VIN pin. This ringing can couple to the output and be mistaken as loop instability or could even damage the part. 

- The output capacitor affects the  control loop stability of the boost regulator. 
	
	Under spec leads to instability, over spec may cause slow response. 
	Output capacitor derating needs consideration.
	
	- Bad ceramics may lose up to 80% capacitance at the rated voltage 
	- Bad electrolytics derate based on temperature and age
  - Bad aluminum caps which have been in storage may be well derated out of the box


- A related problem, which is not using proper bulk capacitance at the inputs - 
	use of only ceramic capacitors

-  Poor quality connectors to the battery/ poor contact / poor choice of connector.
	
	Some batteries use 2.54mm / 1.27mm pitch JST connectors, these usually cannot handle more 1A, and coupled with poor wires, eqv. resistance could be 1 ohm or even more. 1 ohm at 1A is a drop of 1V - that's a 3.7V battery coming in as 2.7V - which is a 27% drop - which means a corresponding increase in current draw - not good for sudden load spikes.

-----------------------

Trust nothing, measure.