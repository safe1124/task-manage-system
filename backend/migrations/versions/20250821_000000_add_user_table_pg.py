"""add user table for postgres

Revision ID: add_user_pg
Revises:
Create Date: 2025-08-21 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = 'add_user_pg'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_table',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('mail', sa.String(), nullable=False, unique=True),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('token', sa.String()),
        sa.Column('token_expires', sa.DateTime()),
    )


def downgrade():
    op.drop_table('user_table')


