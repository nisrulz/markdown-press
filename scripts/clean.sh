#!/usr/bin/env bash
# Moves build output to .trash/ so nothing is deleted outright.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
trash="$root/.trash"
stamp="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$trash"

for name in dist coverage; do
  if [ -e "$root/$name" ]; then
    mv "$root/$name" "$trash/$name-$stamp"
    printf '→ moved %s to .trash/%s-%s\n' "$name" "$name" "$stamp"
  fi
done

printf '✓ clean\n'
