#! /bin/bash
cd files
for n in {0..9}; do
  cat /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | fold -w 30 | head -n 1 > "file$(printf "%03d" "$n").txt"
done