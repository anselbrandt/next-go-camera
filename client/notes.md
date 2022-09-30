# notes

```
ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" out.avi
```

`-i 0:none` will select the 0 indexed video source and no audio

```
ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "0:none" -vcodec libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv422p -f mpegts udp://localhost:12345
```
