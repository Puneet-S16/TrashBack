from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    points = Column(Integer, default=0)

    logs = relationship("DisposalLog", back_populates="user")

class PlasticCode(Base):
    __tablename__ = "plastic_codes"

    code = Column(String, primary_key=True, index=True)
    is_used = Column(Boolean, default=False)
    # Storing which user used it could be useful for debugging, but not strictly required by prompt MVP. 
    # Adding it for completeness based on "used_by" in prompt description data model.
    used_by = Column(Integer, ForeignKey("users.id"), nullable=True) 
    used_at = Column(DateTime, nullable=True)

class DisposalLog(Base):
    __tablename__ = "disposal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code = Column(String, ForeignKey("plastic_codes.code"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    points_awarded = Column(Integer)

    user = relationship("User", back_populates="logs")
