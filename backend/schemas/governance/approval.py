from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ApprovalStatus(str, Enum):
    """
    Enterprise approval status.
    """

    PENDING = "pending"

    APPROVED = "approved"

    REJECTED = "rejected"


class ApprovalRequest(BaseModel):
    """
    Approval workflow request.
    """

    approval_id: str = Field(default="")

    resource_type: str = Field(default="")

    resource_id: str = Field(default="")

    requested_by: str = Field(default="system")

    assigned_to: str = Field(default="")

    status: ApprovalStatus = ApprovalStatus.PENDING

    comments: str = Field(default="")

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )