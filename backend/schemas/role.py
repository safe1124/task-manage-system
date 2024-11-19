from pydantic import BaseModel
from uuid import UUID

class RoleBase(BaseModel):
    user_role: int
    admin_role: int

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    user_id: UUID

    class Config:
        orm_mode = True
