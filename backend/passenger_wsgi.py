import sys
import os

# Add project path
proj_path = os.path.dirname(__file__)
if proj_path not in sys.path:
    sys.path.insert(0, proj_path)

from app import create_app

application = create_app()
