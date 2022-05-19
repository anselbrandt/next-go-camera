# Next Go Camera

# Raspberry Pi

The following should work with any official Raspberry Pi camera and Bullseye.

```
libcamera-vid -t 0 -o -| ffmpeg -framerate 30 -i - -c:v libx264 -g 10 -preset ultrafast -tune zerolatency -f rtp 'rtp://127.0.0.1:5004?pkt_size=1200'
```