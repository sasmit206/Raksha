from app.db.database import SessionLocal, Base, engine
from app.models.all import User
import uuid

Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    user = User(id=str(uuid.uuid4()), username="test2", hashed_password="123")
    db.add(user)
    db.commit()
    print("Success inserting to DB")
except Exception as e:
    print(f"Error: {e}")
