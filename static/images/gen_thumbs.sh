#!/bin/bash

#white
for i in `ls w/`
  do
    if [ -d w/$i ]
      then
        if [ w/$i != "w/thumbs" ]
          then
            inkscape -f w/$i/back.svg -e w/thumbs/$i.png
            convert -resize 35 w/thumbs/$i.png w/thumbs/$i.png
        fi
    fi
  done

#black
for i in `ls b/`
  do
    if [ -d b/$i ]
      then
        if [ b/$i != "b/thumbs" ]
          then
            inkscape -f b/$i/front.svg -e b/thumbs/$i.png
            convert -resize 35 b/thumbs/$i.png b/thumbs/$i.png
        fi
    fi
  done
