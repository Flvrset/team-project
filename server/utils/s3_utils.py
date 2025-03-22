from PIL import Image
from io import BytesIO
from minio import Minio
from config import Config

minio_client = Minio(
    Config.MINIO_HOST,
    access_key=Config.MINIO_KEY,
    secret_key=Config.MINIO_SECRET_KEY,
    secure=False,
)


def create_thumbnail_and_upload(
    file, bucket_name, object_name, thumbnail_size=(150, 150)
):
    img = Image.open(file)

    img.thumbnail(thumbnail_size, Image.ANTIALIAS)

    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    minio_client.put_object(
        bucket_name,  # Bucket name
        object_name,  # Object name (filename)
        img_byte_arr,  # Image as a byte stream
        len(img_byte_arr.getvalue()),  # File size
    )
