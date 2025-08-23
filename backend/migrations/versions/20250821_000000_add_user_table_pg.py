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
        'users',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('mail', sa.String(), nullable=False, unique=True),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('avatar_url', sa.String(), nullable=True),
    )


def downgrade():
    op.drop_table('users')


