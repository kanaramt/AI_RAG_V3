from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db

from backend.services.document_management.document_sql_repository import (
    DocumentSQLRepository,
)

router = APIRouter(
    tags=["Document Catalog"],
)


@router.get("/document-catalog")
def get_documents(
    db: Session = Depends(get_db),
):
    repository = DocumentSQLRepository(db)

    return repository.get_all()