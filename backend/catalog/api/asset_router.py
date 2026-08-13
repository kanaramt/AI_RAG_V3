from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db

from backend.catalog.repositories.asset_sql_repository import (
    AssetSQLRepository,
)

from backend.catalog.schemas.knowledge_asset import (
    KnowledgeAsset,
    SourceType,
)
from backend.catalog.services.asset_service import (
    AssetService,
)

router = APIRouter(
    prefix="/catalog",
    tags=["Knowledge Catalog"],
)

def get_asset_service(
    db: Session = Depends(get_db),
) -> AssetService:

    repository = AssetSQLRepository(db)

    return AssetService(repository)


@router.post("/assets")
async def create_asset(
    source_type: SourceType,
    source_name: str,
    title: str,
    owner: str = "",
    department: str = "",
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    return asset_service.create_asset(
        source_type=source_type,
        source_name=source_name,
        title=title,
        owner=owner,
        department=department,
    )


@router.get("/assets")
async def get_assets(
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    return asset_service.get_assets()


@router.get("/analytics")
async def get_catalog_analytics(
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    return asset_service.get_analytics()


@router.get("/assets/search/{query}")
async def search_assets(
    query: str,
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    return asset_service.search_assets(query)


@router.get("/assets/{asset_id}")
async def get_asset(
    asset_id: str,
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    asset = asset_service.get_asset(asset_id)

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Asset not found.",
        )

    return asset


@router.put("/assets/{asset_id}")
async def update_asset(
    asset_id: str,
    asset: KnowledgeAsset,
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    if asset.asset_id != asset_id:
        raise HTTPException(
            status_code=400,
            detail="Asset ID mismatch.",
        )

    return asset_service.update_asset(asset)


@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: str,
    asset_service: AssetService = Depends(
        get_asset_service
    ),
):
    success = asset_service.delete_asset(asset_id)

    return {
        "success": success,
    }