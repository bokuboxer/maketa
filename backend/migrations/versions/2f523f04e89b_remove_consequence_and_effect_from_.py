"""remove_consequence_and_effect_from_element_type

Revision ID: 2f523f04e89b
Revises: remove_self_score
Create Date: 2025-03-04 04:38:45.639404

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "2f523f04e89b"
down_revision: Union[str, None] = "remove_self_score"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # First, delete CONSEQUENCE and EFFECT data
    op.execute("DELETE FROM elements WHERE type IN ('CONSEQUENCE', 'EFFECT')")

    # Then update the enum type
    op.execute(
        "ALTER TABLE elements MODIFY COLUMN type ENUM('ADVERSITY', 'BELIEF', 'DISPUTATION') NOT NULL DEFAULT 'BELIEF'"
    )

    # Then proceed with other changes
    op.drop_constraint("elements_ibfk_1", "elements", type_="foreignkey")
    op.create_foreign_key(None, "elements", "failures", ["failure_id"], ["id"])
    op.alter_column(
        "failures",
        "has_analyzed",
        existing_type=mysql.TINYINT(display_width=1),
        nullable=False,
    )
    op.drop_constraint("failures_ibfk_1", "failures", type_="foreignkey")
    op.create_foreign_key(None, "failures", "users", ["user_id"], ["id"])

    # Drop the unique index on firebase_uid before changing the column type
    op.drop_index("firebase_uid", table_name="users")

    # Change column types to TEXT
    op.alter_column(
        "users",
        "firebase_uid",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=128),
        type_=sa.Text(),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "email",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "display_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        type_=sa.Text(),
        existing_nullable=True,
    )

    # Recreate the unique index on firebase_uid with a specified length
    op.execute("CREATE UNIQUE INDEX firebase_uid ON users(firebase_uid(128))")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # Drop the unique index on firebase_uid
    op.drop_index("firebase_uid", table_name="users")

    # Restore the original enum type
    op.execute(
        "ALTER TABLE elements MODIFY COLUMN type ENUM('ADVERSITY', 'BELIEF', 'CONSEQUENCE', 'DISPUTATION', 'EFFECT') NOT NULL DEFAULT 'BELIEF'"
    )

    # Then proceed with other changes
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.Text(),
        type_=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        existing_nullable=True,
    )
    op.alter_column(
        "users",
        "email",
        existing_type=sa.Text(),
        type_=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "firebase_uid",
        existing_type=sa.Text(),
        type_=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=128),
        existing_nullable=False,
    )

    # Recreate the unique index on firebase_uid
    op.create_index("firebase_uid", "users", ["firebase_uid"], unique=True)

    op.drop_constraint(None, "failures", type_="foreignkey")
    op.create_foreign_key(
        "failures_ibfk_1", "failures", "users", ["user_id"], ["id"], ondelete="CASCADE"
    )
    op.alter_column(
        "failures",
        "has_analyzed",
        existing_type=mysql.TINYINT(display_width=1),
        nullable=True,
    )
    op.drop_constraint(None, "elements", type_="foreignkey")
    op.create_foreign_key(
        "elements_ibfk_1",
        "elements",
        "failures",
        ["failure_id"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###
