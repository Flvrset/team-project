# Use the official PostgreSQL image
FROM postgres:16

# Set environment variables for default user and database
ENV POSTGRES_USER=dummy_user
ENV POSTGRES_PASSWORD=dummy_password
ENV POSTGRES_DB=petbuddies

# Copy the schema SQL file to the container
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL default port
EXPOSE 5432
