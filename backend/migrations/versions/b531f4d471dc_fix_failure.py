"""fix-failure

Revision ID: b531f4d471dc
Revises: 26468e89757c
Create Date: 2025-03-07 04:54:39.074226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'b531f4d471dc'
down_revision: Union[str, None] = '26468e89757c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('failures', sa.Column('detail', sa.Text(), nullable=True))
    op.drop_column('failures', 'conclusion')
    op.drop_column('failures', 'hero_failure_reason')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('failures', sa.Column('hero_failure_reason', mysql.TEXT(), nullable=True))
    op.add_column('failures', sa.Column('conclusion', mysql.TEXT(), nullable=True))
    op.drop_column('failures', 'detail')
    # ### end Alembic commands ###
