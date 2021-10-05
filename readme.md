# Nectar

This repository contains the react-powered front end for the mca iba
lab infrastructure.

[Getting started with react](react.md)

To install all required packages through node:
```
npm install
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



