from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import models
from database import engine, get_db
import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrashBack API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Requests
class ScanRequest(BaseModel):
    user_id: int
    code: str

class UserResponse(BaseModel):
    id: int
    name: str
    points: int
    # history could be added here if we want to return it in one go

class DisposalHistoryItem(BaseModel):
    id: int
    code: str
    points_awarded: int
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

class StatsResponse(BaseModel):
    total_disposals: int
    total_points_issued: int
    used_codes: int
    unused_codes: int

# CONSTANTS
POINTS_PER_ITEM = 10

@app.post("/scan")
def scan_code(request: ScanRequest, db: Session = Depends(get_db)):
    # Check code validity
    plastic = db.query(models.PlasticCode).filter(models.PlasticCode.code == request.code).first()
    
    if not plastic:
        raise HTTPException(status_code=404, detail="Invalid code")
    
    if plastic.is_used:
        raise HTTPException(status_code=400, detail="Code already used")

    # Check user existence (auto-create for demo simplicity? The prompt says "User can Enter... code", implies user exists. 
    # But usually a user is logged in. 
    # Prompt says "User can: View personal disposal history".
    # Prompt "User... id, name, points". 
    # Let's assume we pass a user_id. If valid user, proceed. 
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        # Create user on fly for demo if not exists? Or should we seed users?
        # Prompt says "Data Models... User id, name, points".
        # Let's seed a user "Demo User" with ID 1 in seed.py and use that mainly.
        # Or auto-create here to be friendly.
        user = models.User(id=request.user_id, name=f"User {request.user_id}")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Execute Disposal
    plastic.is_used = True
    plastic.used_by = user.id
    plastic.used_at = datetime.datetime.utcnow()
    
    user.points += POINTS_PER_ITEM
    
    log = models.DisposalLog(
        user_id=user.id,
        code=request.code,
        points_awarded=POINTS_PER_ITEM
    )
    
    db.add(log)
    db.commit()
    
    return {"message": "Success", "points_awarded": POINTS_PER_ITEM, "new_total": user.points}

@app.get("/user/{user_id}")
def get_user_data(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    history = db.query(models.DisposalLog).filter(models.DisposalLog.user_id == user_id).order_by(models.DisposalLog.timestamp.desc()).all()
    
    return {
        "id": user.id,
        "name": user.name,
        "points": user.points,
        "history": history
    }

@app.get("/admin/stats", response_model=StatsResponse)
def get_admin_stats(db: Session = Depends(get_db)):
    total_disposals = db.query(models.DisposalLog).count()
    total_points = db.query(func.sum(models.DisposalLog.points_awarded)).scalar() or 0
    used_codes = db.query(models.PlasticCode).filter(models.PlasticCode.is_used == True).count()
    unused_codes = db.query(models.PlasticCode).filter(models.PlasticCode.is_used == False).count()
    
    return {
        "total_disposals": total_disposals,
        "total_points_issued": total_points,
        "used_codes": used_codes,
        "unused_codes": unused_codes
    }

@app.post("/admin/reset")
def reset_data(db: Session = Depends(get_db)):
    # Reset all users points
    db.query(models.User).update({models.User.points: 0})
    
    # Reset all codes
    db.query(models.PlasticCode).update({
        models.PlasticCode.is_used: False, 
        models.PlasticCode.used_by: None,
        models.PlasticCode.used_at: None
    })
    
    # Clear logs
    db.query(models.DisposalLog).delete()
    
    db.commit()
    return {"message": "Demo data reset successfully"}
