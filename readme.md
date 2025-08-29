# Nectar

This repository contains the react-powered front end for the mca iba
lab infrastructure.

[Getting started with react](react.md)

To install all required packages through node:
```
npm install --legacy-peer-deps
```

To build a production deployment package:
```
npm run build
```
These files will have to be copied to your web-server. (nginx, lighttpd, apache, ...)

To run it locally:
```
npm run start
```

To run the server, you can make use of any http server (like nginx or apache). For convenience, a python script is offered to do this as well.
Be aware that this is a single page application. This has some implications with regards to routing. If you do not keep this into account, the
Shortcuts at the top might not work properly in a production build.

```
cp run.py build/
cd build
python run.py
```

To build and deploy these files to a running http server (e.g. nginx):
```
npm run build && cp -a build/* /usr/share/nginx/html/waspjs && systemctl restart nginx
```

Mak esure this folder is referenced in your nginx config.
You might have to refresh your webpage and clear the cache (ctrl + f5 in most browsers).

## Raspberry Pi Daybook

The pi is configured to open the chromium browser in kiosk mode.
Exit it using ctrl+alt+F4. Then enter the username and password.
- X-server makes sure a basic UI system is present on the `Raspberry Pi Lite Os` (which doesnt have Ui by default).
- Openbox serves as a minimal window manager.
- Chromium is the webbrowser.
- Unclutter removes the mouse cursor.

Configuration files:
- `~/.bash_profile`: runs `startx`, makes the Pi start X + Openbox + Chromium in kiosk mode as soon as it boots.
- `~/.config/openbox/autostart`: defines the url to be opened in Chromium: `https://waspjs.capitan.imec.be/daybook?no-appbar=true`
- Some additional configurations were set to disable screen blanking, that is the pi going to sleep after a long time of no activity (which is expected, since no HID-devices are connected to the pi).
