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


def upgrade() -> None:
    # Add session_id column to user_table
    op.add_column('user_table', sa.Column('session_id', sa.String(), nullable=True))
    op.create_index('ix_user_table_session_id', 'user_table', ['session_id'], unique=True)
    
    # Remove unused token fields
    try:
        op.drop_column('user_table', 'token')
        op.drop_column('user_table', 'token_expires')
    except:
        pass  # Columns may not exist


def downgrade() -> None:
    # Remove session_id column
    op.drop_index('ix_user_table_session_id', table_name='user_table')
    op.drop_column('user_table', 'session_id')
    
    # Add back token fields
    op.add_column('user_table', sa.Column('token', sa.String(), nullable=True))
    op.add_column('user_table', sa.Column('token_expires', sa.DateTime(), nullable=True))
