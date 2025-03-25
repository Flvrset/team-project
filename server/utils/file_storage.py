import boto3
from botocore.client import Config

from utils.utils_photo import resize_image

s3_client = boto3.client(
    's3',
    endpoint_url='http://storage:9000',
    aws_access_key_id='myappuser',
    aws_secret_access_key='app_user_password',
    config=Config(signature_version='s3v4')
)


def generate_presigned_url(filepath, filename):
    return s3_client.generate_presigned_url(
        "get_object",
        Params={'Bucket': 'upload', 'Key': f'{filepath}/{filename}.webp'},
        ExpiresIn=3600
    ).replace("http://storage:9000", "/storage")


def upload_object(file, filepath, filename):
    file_to_upload = resize_image(file)

    s3_client.put_object(
        Bucket="upload",
        Key=f'{filepath}/{filename}.webp',
        Body=file_to_upload.getvalue(),
        ContentType='image/webp'
    )


def delete_object(filepath, filename):
    s3_client.delete_object(
        Bucket="upload",
        Key=f'{filepath}/{filename}.webp'
    )