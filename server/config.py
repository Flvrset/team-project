class Config:
    # TO BE REMOVED INTO ENV OR SECRETS
    # JUST FOR THE TESTS
    JWT_SECRET_KEY = "0ce63f6a5a7cfc56221c6aa1d0550f720dea54b863f78259a8b39f9214f9fba2"
    JWT_TOKEN_LOCATION = ["cookies"]  # Store JWT in cookies
    JWT_COOKIE_SECURE = False  # Set to True in production (for HTTPS)
    JWT_COOKIE_HTTPONLY = True  # Prevent JavaScript access
    JWT_COOKIE_SAMESITE = "Lax"  # Prevent CSRF issues

    SQLALCHEMY_DATABASE_URI = "postgresql://dummy_user:dummy_secure_password@database:5432/petbuddies"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
