#!/usr/bin/env bash
# Optional asset authoring only; Flite-enabled FFmpeg is not needed by the game.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -hide_banner -loglevel error -f lavfi -i "flite=text='The king has won':voice=awb" -af "asetrate=14400,aresample=24000,atempo=0.94,highpass=f=90,lowpass=f=6500,aecho=0.8:0.7:75:0.22,alimiter=limit=0.85,afade=t=in:d=0.025,apad=pad_dur=0.15" -codec:a libmp3lame -b:a 96k -y public/audio/king-victory.mp3
