# Use an official Python image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy requirements file and install dependencies
COPY ./server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend code
COPY ./server /app

# Expose port 5000 (Flask default)
EXPOSE 5000

# Command to run Flask with Gunicorn
CMD ["gunicorn", "--config", "gunicorn_config.py", "wsgi:app"]