"""add session_id to user table

Revision ID: add_session_id_to_user
Revises: add_user_table_pg
Create Date: 2025-08-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_session_id_to_user'
down_revision = 'add_user_pg'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('session_id', sa.String(), nullable=True))
    op.create_index('ix_users_session_id', 'users', ['session_id'], unique=True)


def downgrade():
    op.drop_index('ix_users_session_id', table_name='users')
    op.drop_column('users', 'session_id')
