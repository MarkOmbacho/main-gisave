"""add mentor_applications table

Revision ID: add_mentor_applications_table
Revises: 39f33a23f7c3_auth_audit_add_refresh_token_and_audit_
Create Date: 2025-10-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_mentor_applications_table'
down_revision = '39f33a23f7c3_auth_audit_add_refresh_token_and_audit_'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'mentor_applications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.user_id')),
        sa.Column('expertise', sa.Text(), nullable=True),
        sa.Column('documents', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=True, server_default='pending'),
        sa.Column('admin_note', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table('mentor_applications')
