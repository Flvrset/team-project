from PIL import Image
import io


def resize_image(image, size=(400, 400)):
    """Resize image to create a thumbnail in memory."""
    img = Image.open(image)

    img = img.convert("RGB")
    img.thumbnail(size)

    # Save the resized image to a BytesIO object (in-memory file)
    img_io = io.BytesIO()
    img.save(img_io, "WEBP", quality=80)
    img_io.seek(0)  # Go to the beginning of the BytesIO object

    return img_io
