"""update element type

Revision ID: 98f6f13845fb
Revises: f64a54526f2e
Create Date: 2024-02-27 14:30:00.000000

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "98f6f13845fb"
down_revision: Union[str, None] = "f64a54526f2e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add a new column with the new enum type
    op.execute(
        'ALTER TABLE elements ADD COLUMN new_type ENUM("ADVERSITY", "BELIEF", "CONSEQUENCE", "DISPUTATION", "EFFECT") NOT NULL DEFAULT "BELIEF"'
    )

    # Convert existing data to new enum values
    op.execute('UPDATE elements SET new_type = "BELIEF" WHERE type = "INTERNAL"')
    op.execute('UPDATE elements SET new_type = "CONSEQUENCE" WHERE type = "EXTERNAL"')
    op.execute('UPDATE elements SET new_type = "EFFECT" WHERE type = "EMOTIONAL"')

    # Drop the old column and rename the new one
    op.execute("ALTER TABLE elements DROP COLUMN type")
    op.execute(
        'ALTER TABLE elements CHANGE COLUMN new_type type ENUM("ADVERSITY", "BELIEF", "CONSEQUENCE", "DISPUTATION", "EFFECT") NOT NULL DEFAULT "BELIEF"'
    )


def downgrade() -> None:
    # Add a new column with the old enum type
    op.execute(
        'ALTER TABLE elements ADD COLUMN old_type ENUM("INTERNAL", "EXTERNAL", "EMOTIONAL") NOT NULL DEFAULT "INTERNAL"'
    )

    # Convert data back to old enum values
    op.execute('UPDATE elements SET old_type = "INTERNAL" WHERE type = "BELIEF"')
    op.execute('UPDATE elements SET old_type = "EXTERNAL" WHERE type = "CONSEQUENCE"')
    op.execute('UPDATE elements SET old_type = "EMOTIONAL" WHERE type = "EFFECT"')

    # Drop the new column and rename the old one
    op.execute("ALTER TABLE elements DROP COLUMN type")
    op.execute(
        'ALTER TABLE elements CHANGE COLUMN old_type type ENUM("INTERNAL", "EXTERNAL", "EMOTIONAL") NOT NULL DEFAULT "INTERNAL"'
    )
