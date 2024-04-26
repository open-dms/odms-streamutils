#!/usr/bin/env bash

coverage=$(bun run test:coverage 2>&1 | grep "All files" | cut -d "|" -f3 | xargs)
color=$([[ $coverage -gt 80 ]] && echo "green" || echo "red")
wget -O coverage.svg "https://img.shields.io/badge/Coverage-$coverage%-$color"