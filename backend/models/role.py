from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Role(Base):
    __tablename__ = "role_table"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user_table.user_id"), primary_key=True)
    user_role = Column(Integer, default=0)
    admin_role = Column(Integer, default=0)
