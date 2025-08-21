"""merge heads

Revision ID: a0a3184272ac
Revises: ee58781f25ed, add_session_id_to_user
Create Date: 2025-08-21 18:58:37.515996+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a0a3184272ac'
down_revision: Union[str, None] = ('ee58781f25ed', 'add_session_id_to_user')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
