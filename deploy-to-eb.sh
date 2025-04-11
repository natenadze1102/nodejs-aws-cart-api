#!/bin/bash

# Initialize Elastic Beanstalk application if not already done
# eb init already done manually

# Use a more optimized deployment approach
# 1. Set environment variables for increased Docker build memory
export DOCKER_BUILDKIT=1
export DOCKER_DEFAULT_PLATFORM=linux/amd64
export DOCKER_CLI_EXPERIMENTAL=enabled

# 2. Clean up any Docker cache that might be causing issues
docker system prune -f

# 3. Build the Docker image locally first to avoid EB timeout
echo "Pre-building Docker image locally to speed up deployment..."
docker build -t natenadze1102/cart-api:latest --build-arg NODE_OPTIONS="--max-old-space-size=4096" .

# 4. Deploy with optimized settings
echo "Creating new Elastic Beanstalk environment with optimized settings..."
eb create devt --cname natenadze1102-cart-api-devt --single --timeout 25 \
  --envvars "NODE_OPTIONS=--max-old-space-size=4096,DB_HOST=cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com,DB_PORT=5432,DB_USERNAME=postgres,DB_PASSWORD=1tCez7g1ere6DNgTwQS7,DB_NAME=cartdb,DB_SSL=true,DB_SYNC=true,DB_LOGGING=true"

# If you want to update an existing environment instead, comment out the above and uncomment this:
# echo "Deploying to Elastic Beanstalk with optimized settings..."
# eb deploy --staged --timeout 25

# If you want to create a new environment instead, uncomment and use this:
# eb create prod \
#   --cname natenadze1102-cart-api-prod \
#   --single \
#   --timeout 20 \
#   --instance_type t3.small \
#   --envvars "NODE_OPTIONS=--max-old-space-size=4096,DB_HOST=cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com,DB_PORT=5432,DB_USERNAME=postgres,DB_PASSWORD=1tCez7g1ere6DNgTwQS7,DB_NAME=cartdb,DB_SSL=true,DB_SYNC=true,DB_LOGGING=true"
