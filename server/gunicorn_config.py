import multiprocessing

# Number of worker processes for handling requests
workers = multiprocessing.cpu_count() * 2 + 1

# Number of threads per worker (optional, depending on how much concurrency you need)
threads = 2

# Address and port to bind Gunicorn to
bind = '0.0.0.0:8000'  # Accessible on all IPs, port 8000

# Timeout for workers
timeout = 30

# Access log location (- means logging to stdout)
accesslog = '-'

# Error log location (- means logging to stderr)
errorlog = '-'

# Log level (info, debug, warning, error, critical)
loglevel = 'info'

# Daemon mode (True will make Gunicorn run in the background)
daemon = False

# Preload the app to save memory
preload_app = True

# Sync worker class (you can change to 'gevent' or 'eventlet' for async processing)
worker_class = 'sync'