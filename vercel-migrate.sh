#!/bin/bash
# Run this script to manually migrate your Vercel Postgres database

echo "Running Prisma migration on Vercel..."
npx prisma migrate deploy

echo "Migration complete!"
