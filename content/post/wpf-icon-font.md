---
title: "Material Icons in WPF"
date: 2019-04-16
description: "A straightforward way to use icons"
tags: [xaml, wpf, dotnet]
featured_image: "/images/wpf-add-font.jpg"
categories: dev
comment : false
---

## Icon  Fonts with ligatures

The key is using icon fonts with [ligatures][1].

This makes usage incredibly easy because you can directly use a sensible *name* instead of adding an extra resource for indirection of Unicode characters.

## Step  1

Download the icon font from https://material.io/resources/icons/ (or another resource)

WPF supports both True Type Fonts (TTF) and Open Type Fonts (OTF).

Extract the included `ttf` file from the archive. You can also download it [here][2].

## Step 2 

Add to your project under any subfolder. Here I'm calling it `/Fonts`.

{{< figure src="/images/wpf-add-font1.jpg" >}}

In the file properties, set the build action to `Resource`, and Copy to `Copy if newer`.

{{< figure src="/images/wpf-add-font2.jpg" >}}

## Step 3

You can now reference your font using `./Fonts/#<font name>`.

In your `App.xaml`, add a resource - this makes it easy to swap out fonts later.

```xaml
<Application x:Class="my.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:my"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <FontFamily x:Key="IconFont">./Fonts/#Material Icons</FontFamily>        
    </Application.Resources>
</Application>		
```

**Note**: 

The build tool treats it as an embedded font, so use the font family name, and not the font's file name.

## Step 3

Use it any where by setting `FontFamily`, and the `Content`.

```
FontFamily="{StaticResource IconFont}" Content="icon_name"
```

Pick any icon from the set.

{{< figure src="/images/wpf-add-font3.jpg" >}}

Example:

```xaml
<Button FontFamily="{StaticResource IconFont}" Foreground="Red">favorite</Button>
```

{{< figure src="/images/wpf-add-font4.jpg" >}}

And that's it!

[1]: https://en.wikipedia.org/wiki/Orthographic_ligature	"Orthographic ligature"
[2]: /fonts/MaterialIcons-Regular.ttf	"Download MaterialIcons-Regular.ttf from here"