import sys
import os

# Add the project root to the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import engine
from models.base import Base
from models.task import Task
from models.user import User

def init_db():
    """
    Initializes the database by creating all tables defined in the models.
    This script should be run once to set up the database.
    """
    print("Initializing database...")
    # The models User and Task are imported so that their table metadata is registered
    # with the Base declarative base.
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete. Tables created.")

if __name__ == "__main__":
    init_db()
