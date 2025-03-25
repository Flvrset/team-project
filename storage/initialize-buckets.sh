#!/bin/sh

sleep 5

is_minio_ready() {
  mc alias set myminio http://storage:9000 minioadmin minioadmin
  mc ls myminio
}

max_retries=10
retry_delay=5
attempt=1

until is_minio_ready || [ "$attempt" -ge "$max_retries" ]
do
  echo "Waiting for MinIO to be ready (attempt $attempt/$max_retries)..."
  attempt=$((attempt + 1))
  sleep $retry_delay
done

if [ "$attempt" -ge "$max_retries" ]; then
  echo "MinIO is not ready after $max_retries attempts, exiting script."
  exit 1
fi

mc mb --ignore-existing myminio/upload

touch /temp_file.txt

mc cp /temp_file.txt myminio/upload/user_photo/.keep
mc cp /temp_file.txt myminio/upload/pet_photo/.keep

rm /temp_file.txt

echo "Creating app user..."
mc admin user add myminio myappuser app_user_password

echo "Setting policies..."
mc admin policy create myminio myappuser-bucket-policy /storage/bucket-policy.json
mc admin policy attach myminio myappuser-bucket-policy --user=myappuser
mc admin user info myminio myappuser

echo "Bucket and folders successfully created!"