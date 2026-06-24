from pydantic import BaseModel
from typing import Optional

class Store(BaseModel):
    can_trade_dog: Optional[bool] = False
    
    class Config:
        from_attributes = True

class DBStore:
    can_trade_dog = None

print(Store.model_validate(DBStore()).model_dump())
