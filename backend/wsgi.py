import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.chdir(BASE_DIR)

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BASE_DIR / ".env")

from a2wsgi import ASGIMiddleware  # noqa: E402

from main import app  # noqa: E402

application = ASGIMiddleware(app)
