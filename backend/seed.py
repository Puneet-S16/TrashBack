from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import random
import string

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def seed_data():
    db = SessionLocal()
    
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)
    
    # Check if we have codes
    if db.query(models.PlasticCode).count() == 0:
        print("Seeding Plastic Codes...")
        codes = []
        for _ in range(50): # Generate 50 codes
            code_str = generate_code()
            # Ensure uniqueness
            while any(c.code == code_str for c in codes):
                code_str = generate_code()
            
            codes.append(models.PlasticCode(code=code_str))
        
        db.add_all(codes)
        db.commit()
        print(f"Seeded {len(codes)} codes.")
        
        # Print a few for the user to valid test with
        print("Sample codes for testing:")
        for c in codes[:5]:
            print(f"- {c.code}")
    else:
        print("Codes already exist, skipping seed.")
        
    # Seed a Demo User
    if not db.query(models.User).filter(models.User.id == 1).first():
        print("Seeding Demo User...")
        user = models.User(id=1, name="Demo User", points=0)
        db.add(user)
        db.commit()
        print("User seeded.")

    db.close()

if __name__ == "__main__":
    seed_data()
