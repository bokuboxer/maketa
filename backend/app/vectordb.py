import weaviate
import os
import logging
from weaviate.util import generate_uuid5
import pandas as pd
from tqdm import tqdm
from pprint import pprint

from app.schema import Hero

logger = logging.getLogger(__name__)


class VectorDB:
    def __init__(self, port: int = 8080):
        self.port = port
        self.client = self._create_client()
        try:
            logger.info("Successfully connected to Weaviate")
            self._create_collection()
        except Exception as e:
            logger.error(f"Failed to initialize VectorDB: {e}")
            raise

    def _create_client(self):
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
                    url="http://localhost:8080",
                    additional_headers=headers,
                )
            return client
        except Exception as e:
            logger.error(f"Failed to create Weaviate client: {e}")
            raise

    def _create_collection(self):
        try:
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
                        "moduleConfig": {
                            "text2vec-openai": {
                                "skip": False,
                                "vectorizePropertyName": False,
                            }
                        },
                    },
                    {
                        "name": "source",
                        "dataType": ["text"],
                    },
                ],
            }

            if not self.client.schema.exists("Hero"):
                logger.info("Creating Hero collection...")
                self.client.schema.create_class(class_obj)
                logger.info("Hero collection created successfully")
            else:
                logger.info("Hero collection already exists")
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise

    def import_data(self, csv_path: str):
        df = pd.read_csv(csv_path)
        batch_size = 100
        with self.client.batch as batch:
            batch.batch_size = batch_size
            for _, batch_df in tqdm(df.iterrows()):
                properties = {
                    "name": batch_df["Name"],
                    "description": batch_df["Description"],
                    "failure": batch_df["Failure"],
                    "source": batch_df["Source"],
                }

                batch.add_data_object(
                    data_object=properties,
                    class_name="Hero",
                    uuid=generate_uuid5(batch_df["Name"]),
                )

    def query_collection(self, search_query: str, limit: int) -> list[Hero] | None:
        try:
            response = (
                self.client.query.get(
                    "Hero", ["name", "description", "failure", "source"]
                )
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
                        certainty=obj.get("_additional", {}).get("certainty", 0),
                    )
                )
            logger.info(f"Found {len(heroes)} matching heroes")
            return heroes

        except Exception as e:
            logger.error(f"Error querying collection: {e}")
            return None

    def close(self):
        if hasattr(self, "client"):
            try:
                self.client = None
                logger.info("Weaviate client closed successfully")
            except Exception as e:
                logger.error(f"Error closing Weaviate client: {e}")

    def __del__(self):
        self.close()


if __name__ == "__main__":
    csv_path = "/Users/kimotonorihiro/dev/llm/maketa/backend/data/output.csv"
    db = VectorDB()
    try:
        db.import_data(csv_path)
        heros = db.query_collection("お金を無駄遣いしてしまった", 10)
        pprint(heros)
    finally:
        db.close()
