#!/bin/bash
set -e

# Pull the latest image
docker pull $REGISTRY/$IMAGE_NAME:latest

# Stop and remove the old container
docker stop bizmatchke || true
docker rm bizmatchke || true

# Run the new container with Render database URL
docker run -d \
  --name bizmatchke \
  --restart unless-stopped \
  -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e GROQ_API_KEY=$GROQ_API_KEY \
  -e SESSION_SECRET=$SESSION_SECRET \
  $REGISTRY/$IMAGE_NAME:latest
