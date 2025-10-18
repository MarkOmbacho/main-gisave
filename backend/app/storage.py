import os
from werkzeug.utils import secure_filename
from datetime import datetime


def save_upload(file_storage, upload_dir):
    # ensure upload_dir exists
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file_storage.filename)
    # add timestamp to avoid collisions
    name, ext = os.path.splitext(filename)
    fname = f"{name}-{int(datetime.utcnow().timestamp())}{ext}"
    path = os.path.join(upload_dir, fname)
    file_storage.save(path)
    return path


def get_public_url_for_local(path, app):
    # Return a simple local path relative to instance folder; in production replace with CDN/S3 signed URL
    inst = app.instance_path
    if path.startswith(inst):
        rel = os.path.relpath(path, inst).replace('\\', '/')
        return f"/instance/{rel}"
    return path
