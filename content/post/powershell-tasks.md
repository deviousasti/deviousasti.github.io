---
title: "Run a PowerShell script for every .NET application crash"
date: 2019-03-22
description: "Track application crashes on the cheap"
tags: [git, powershell]
featured_image: "/images/powershell.jpg"
categories: automation
---

How do you run a script for every application crash without attaching the debugger or some complicated mess? It's easy enough to write a simple script which checks for the life of the process.

```powershell
while($(ps taskmgr*) -ne $null) 
{
  sleep 1  
}

echo "It's dead, Jim!"
```

But that doesn't give us the stack-trace, plus this script has to have a longer life-time than the process you're monitoring.

## Enter The Event Log

An application crash with an unhandled exception always writes to the Application event log. If we could run a task for that, we're half-way done.

And it turns out you can have a scheduled task for exactly that, triggered by an event log item. But adding one is a little involved, since we need some extra query variables to get us the name and stack-trace.

### Scheduled Task

If you're interested, the query is:

```xml
<QueryList>
    <Query Id="0" Path="Application">
        <Select Path="Application">
            *[System[Provider[@Name='.NET Runtime'] and EventID=1026]]	             </Select>
    </Query>
</QueryList>
```

We additionally need a set of `ValueQueries` (see lines 7-11).

It's much easier to download the Scheduled Task Xml, and import it in. 

{{< gist deviousasti 03c735687bb076a4f8e214073868958c>}}

## The PowerShell side of things

The task trigger can be called with named variables we set up in the `ValueQueries`.

```
powershell Trigger.ps1 -eventRecordID $(eventRecordID) -eventChannel $(eventChannel)
```

Now that we have the event id in our script, we can query the log to get back our stack-trace.

```powershell
param($eventRecordID, $eventChannel = "Application")

$event = Get-WinEvent -LogName $eventChannel -FilterXPath "<QueryList><Query Id='0' Path='$eventChannel'><Select Path='$eventChannel'>*[System[(EventRecordID=$eventRecordID)]]</Select></Query></QueryList>"

$stackTrace = $event.Message

if($stackTrace -match "Exception")
{
    echo "Error Thrown in Application" 
    $stackTrace > trace.txt
}
```

The above example will just log the stack-trace to `trace.txt` every time an application crashes. Of course, you can take any action, such as even mailing you when there's a crash with `Send-MailMessage`.



