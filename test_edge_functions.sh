#!/bin/bash

# Load env vars from .env.local if not set
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Fallback to .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run Deno test with environment variables passed through
deno test --allow-net --allow-env --allow-read supabase/tests/user-management.test.ts
