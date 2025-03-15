# Use PostgreSQL official image
FROM postgres:15

# Copy initialization SQL script
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL default port
EXPOSE 5432
