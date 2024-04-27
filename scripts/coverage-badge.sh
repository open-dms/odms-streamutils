#!/usr/bin/env bash

coverage=$(bun run test:coverage 2>&1 | grep "All files" | cut -d "|" -f3 | xargs)
color=$([[ 1 -eq "$(echo "$coverage >= 80" | bc)" ]] && echo "green" || echo "red")
mkdir -p coverage
wget -O coverage/coverage.svg "https://img.shields.io/badge/Coverage-$coverage%-$color"
