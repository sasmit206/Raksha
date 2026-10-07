import os
os.environ["JWT_SECRET_KEY"] = "test"
from app.db.database import SessionLocal, engine, Base
from app.routers.auth import register_user, UserCreate
from app.models.all import User

Base.metadata.create_all(bind=engine)
db = SessionLocal()

user_data = UserCreate(username="test_api_user", password="my_password")
try:
    token = register_user(user_data, db)
    print("SUCCESS!", token)
except Exception as e:
    print("ERROR:", e)
