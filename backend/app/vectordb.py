import weaviate
import os
import logging
from weaviate.util import generate_uuid5
import pandas as pd
from tqdm import tqdm
from pprint import pprint

from app.schema import Hero

logger = logging.getLogger(__name__)


def create_client() -> weaviate.Client:
    try:
        api_key = os.environ.get("OPENAI_API_KEY", "")
        headers = {"X-OpenAI-Api-Key": api_key}

        # 環境に応じてホストを設定
        if os.getenv("ENVIRONMENT") == "production":
            # 本番環境（Azure Container Apps）
            weaviate_url = os.environ.get("WEAVIATE_URL", "")
            if not weaviate_url:
                logger.error("WEAVIATE_URL environment variable is not set")
                raise ValueError("WEAVIATE_URL environment variable is not set")

            logger.info(f"Using production Weaviate URL: {weaviate_url}")
            client = weaviate.Client(
                url=weaviate_url,
                additional_headers=headers,
            )
        else:
            # 開発環境（Docker Compose）
            logger.info("Using development Weaviate configuration")
            client = weaviate.Client(
                url="http://weaviate:8080",
                additional_headers=headers,
            )
        return client
    except Exception as e:
        logger.error(f"Failed to create Weaviate client: {e}")
        raise


def create_collection() -> None:
    client = create_client()
    class_obj = {
        "class": "Hero",
        "vectorizer": "text2vec-openai",
        "moduleConfig": {
            "text2vec-openai": {
                "model": "text-embedding-3-small",
                "modelVersion": "latest",
                "type": "text",
            }
        },
        "properties": [
            {
                "name": "name",
                "dataType": ["text"],
            },
            {
                "name": "description",
                "dataType": ["text"],
            },
            {
                "name": "failure",
                "dataType": ["text"],
            },
            {
                "name": "energy",
                "dataType": ["text"],
            },
            {
                "name": "source",
                "dataType": ["text"],
            },
            {
                "name": "image_url",
                "dataType": ["text"],
            },
        ],
    }
    if not client.schema.exists("Hero"):
        client.schema.create_class(class_obj)


def import_data(csv_path: str) -> None:
    df = pd.read_csv(csv_path)
    batch_size = 100
    client = create_client()
    with client.batch as batch:
        batch.batch_size = batch_size
        for _, batch_df in tqdm(df.iterrows()):
            properties = {
                "name": batch_df["Name"],
                "description": batch_df["Description"],
                "failure": batch_df["Failure"],
                "energy": batch_df["Energy"],
                "source": batch_df["Source"],
                "image_url": batch_df["ImageURL"],
            }
            # 既存のデータを確認
            existing_data = client.data_object.get(
                class_name="Hero",
                uuid=generate_uuid5(batch_df["Name"]),
            )
            # データが存在する場合はスキップ
            if existing_data:
                continue

            batch.add_data_object(
                data_object=properties,
                class_name="Hero",
                uuid=generate_uuid5(batch_df["Name"]),
            )


def query_collection(search_query: str, limit: int) -> list[Hero] | None:
    client = create_client()
    response = (
        client.query.get("Hero", ["name", "description", "failure", "source", "energy", "image_url"])
        .with_near_text({"concepts": [search_query]})
        .with_limit(limit)
        .with_additional(["certainty"])
        .do()
    )

    if (
        "data" not in response
        or "Get" not in response["data"]
        or "Hero" not in response["data"]["Get"]
    ):
        return None

    heroes = []
    for obj in response["data"]["Get"]["Hero"]:
        heroes.append(
            Hero(
                name=obj["name"],
                description=obj["description"],
                failure=obj["failure"],
                source=obj["source"],
                energy=obj["energy"],
                image_url=obj["image_url"],
                certainty=obj.get("_additional", {}).get("certainty", 0),
            )
        )
    logger.info(f"Found {len(heroes)} matching heroes")
    return heroes


if __name__ == "__main__":
    csv_path = "/Users/kimotonorihiro/dev/llm/maketa/backend/data/output.csv"
    create_collection()
    import_data(csv_path)
    heros = query_collection("お金を無駄遣いしてしまった", 10)
    pprint(heros)
