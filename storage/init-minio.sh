#!/bin/sh

# Start MinIO server
echo "Starting MinIO server..."
minio server /data --console-address ":9001" &

# Wait for MinIO to be ready (we will use `mc` to test if it's up)
until mc alias set local http://localhost:9000 admin unpossible_to_guess_123; do
  echo 'Waiting for MinIO to start...'
  sleep 2
done

# Create app user
echo "Creating app user..."
mc admin user add local myappuser app_user_password

# Create buckets if they don't exist
echo "Creating buckets..."
mc mb --ignore-existing local/pet-img
mc mb --ignore-existing local/user-img

# Set policies for the buckets
echo "Setting policies..."
mc admin policy create local myappuser-bucket-policy /bucket-policy.json
mc admin policy attach local myappuser-bucket-policy --user=myappuser
mc admin user info local myappuser

echo "Bucket creation and policy application completed."

# Keep the container running
tail -f /dev/null
