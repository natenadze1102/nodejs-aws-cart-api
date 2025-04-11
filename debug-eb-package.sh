#!/bin/bash

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temp directory: $TEMP_DIR"

# Copy all files except those in .ebignore
echo "Copying files to temp directory..."
rsync -av --exclude-from=.ebignore . $TEMP_DIR

# Check if Dockerfile and Dockerrun.aws.json exist in the copied files
echo "Checking for important files in the temp directory:"
ls -la $TEMP_DIR/Dockerfile || echo "Dockerfile NOT FOUND"
ls -la $TEMP_DIR/Dockerrun.aws.json || echo "Dockerrun.aws.json NOT FOUND"

# Create a zip file like EB would
echo "Creating zip file..."
(cd $TEMP_DIR && zip -r ../eb-package.zip .)

# Get the size of the zip file
ZIP_SIZE=$(du -h "$(pwd)/eb-package.zip" | cut -f1)
echo "Package size: $ZIP_SIZE"

# List the largest files/directories in the package
echo "Largest files/directories in the package:"
unzip -l "$(pwd)/eb-package.zip" | sort -nr -k1 | head -n 20

# Check for any node_modules that might have been accidentally included
echo "Checking for node_modules in package:"
unzip -l "$(pwd)/eb-package.zip" | grep -E "node_modules" | head -n 10

# Check for any large directories that might be causing slow uploads
echo "Checking for potentially large directories:"
unzip -l "$(pwd)/eb-package.zip" | grep -E "dist|coverage|.git|cdk.out" | head -n 10

echo "Debug package created at: $(pwd)/eb-package.zip"
echo ""
echo "DEPLOYMENT RECOMMENDATIONS:"
echo "1. Consider using a pre-built Docker image in Amazon ECR"
echo "2. Try deploying with 'eb deploy --staged' for faster uploads"
echo "3. If package is large, check .ebignore file for missing exclusions"
echo "4. Consider using a larger instance type with 'eb create --instance_type t3.small'"
