from flask_mysqldb import MySQL
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# MySQL database connection extension
mysql = MySQL()

# Cross-Origin Resource Sharing (CORS) extension
cors = CORS()

# Rate limiting extension
limiter = Limiter(key_func=get_remote_address)
