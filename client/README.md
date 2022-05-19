# FFmpeg

## Test Pattern

```
ffmpeg -re -f lavfi -i testsrc=size=640x480:rate=30 -pix_fmt yuv420p -c:v libx264 -g 10 -preset ultrafast -tune zerolatency -f rtp 'rtp://127.0.0.1:5004?pkt_size=1200'
```

## Raspberry Pi Camera

```
libcamera-vid -t 0 -o -| ffmpeg -framerate 30 -i - -c:v libx264 -g 10 -preset ultrafast -tune zerolatency -f rtp 'rtp://127.0.0.1:5004?pkt_size=1200'
```
