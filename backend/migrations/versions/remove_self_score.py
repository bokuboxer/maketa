"""remove self_score

Revision ID: remove_self_score
Revises: 98f6f13845fb
Create Date: 2024-02-27 15:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "remove_self_score"
down_revision: Union[str, None] = "98f6f13845fb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the self_score column
    op.drop_column("failures", "self_score")


def downgrade() -> None:
    # Add back the self_score column
    op.add_column("failures", sa.Column("self_score", sa.Integer(), nullable=True))
