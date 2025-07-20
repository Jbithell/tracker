# Tracker

A tracking system for events, using either an Expo app, or devices compatible with Traccar.

## Expo App

The Expo app is a simple app in the app/ folder.

## Website

The website is a simple React Router 7 App in the website/ folder.

## Traccar

You can use traccar as the intermediary for tracking devices with different protocols.

### Device

The device uses H02 protocol (port 5013)
You can SMS the device using https://portal.1nce.com/portal/customer/dashboard

To set a new address send a message saying `IP,10.10.10.10,5013` (replacing 10.10.10.10 with the IP of the traccar server)

Default address is `IP,27.aika168.com,8185`

![Device Commands](/.github/device-commands-screenshot-1.png)
![Device Commands](/.github/device-commands-screenshot-2.png)

### Setup Traccar forwarding

Stored in `/opt/traccar/conf/traccar.xml` on the traccar server.

<entry key='forward.type'>url</entry>
<entry key='forward.url'>https://traccar-forward-event-tracker.jbithell.com/upload-traccar.json</entry>
<entry key='event.forward.url'>https://traccar-forward-event-tracker.jbithell.com/upload-traccar.json</entry>
<entry key='forward.retry.enable'>true</entry>
<entry key='forward.retry.delay'>10000</entry>
<entry key='forward.retry.count'>1000</entry>
<entry key='forward.retry.limit'>1000</entry>
<entry key='event.forward.type'>json</entry>
