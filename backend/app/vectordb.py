import weaviate
import weaviate.classes.config as wc
import weaviate.classes.query as wq
import weaviate.connect as wcon
import os
import logging
from weaviate.util import generate_uuid5
import pandas as pd
from tqdm import tqdm
from pprint import pprint

from app.schema import Hero

logger = logging.getLogger(__name__)


class VectorDB:
    def __init__(self, port: int = 8080, grpc_port: int = 50051):
        self.port = port
        self.grpc_port = grpc_port
        logger.info("Initializing VectorDB...")
        self.client = self._create_client()
        try:
            self.client.connect()
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

                client = weaviate.WeaviateClient(
                    connection_params=wcon.ConnectionParams.from_url(
                        url=weaviate_url, grpc_port=50051
                    ),
                    additional_headers=headers,
                )
            else:
                # 開発環境（Docker Compose）
                logger.info("Using development Weaviate configuration")
                host = "weaviate"
                secure = False

                client = weaviate.WeaviateClient(
                    connection_params=wcon.ConnectionParams(
                        http={
                            "host": host,
                            "port": self.port,
                            "secure": secure,
                        },
                        grpc={
                            "host": host,
                            "port": self.grpc_port,
                            "secure": secure,
                        },
                    ),
                    additional_headers=headers,
                )
            return client
        except Exception as e:
            logger.error(f"Failed to create Weaviate client: {e}")
            raise

    def _create_collection(self):
        try:
            if not self.client.collections.exists("Hero"):
                logger.info("Creating Hero collection...")
                self.client.collections.create(
                    name="Hero",
                    properties=[
                        wc.Property(name="name", data_type=wc.DataType.TEXT),
                        wc.Property(name="description", data_type=wc.DataType.TEXT),
                        wc.Property(
                            name="failure",
                            data_type=wc.DataType.TEXT,
                            vectorize_property=True,
                        ),
                        wc.Property(name="source", data_type=wc.DataType.TEXT),
                    ],
                    vectorizer_config=wc.Configure.Vectorizer.text2vec_openai(
                        model="text-embedding-3-small",
                        vectorize_collection_name=False,
                    ),
                    generative_config=wc.Configure.Generative.openai(),
                )
                logger.info("Hero collection created successfully")
            else:
                logger.info("Hero collection already exists")
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise

    def import_data(self, csv_path: str):
        df = pd.read_csv(csv_path)
        heros = self.client.collections.get("Hero")
        with heros.batch.dynamic() as batch:
            for _, batch_df in tqdm(df.iterrows()):
                agri_obj = {
                    "name": batch_df["Name"],
                    "description": batch_df["Description"],
                    "failure": batch_df["Failure"],
                    "source": batch_df["Source"],
                }

                batch.add_object(
                    properties=agri_obj,
                    uuid=generate_uuid5(batch_df["Name"]),
                )

    def query_collection(self, search_query: str, limit: int) -> list[Hero] | None:
        try:
            if not self.client.is_connected():
                logger.info("Reconnecting to Weaviate...")
                self.client.connect()

            logger.info(f"Querying collection with: {search_query}")
            response = self.client.collections.get("Hero").query.near_text(
                query=search_query,
                limit=limit,
                return_metadata=wq.MetadataQuery(
                    certainty=True,
                    distance=True,
                ),
                return_properties=["name", "description", "failure", "source"],
                include_vector=True,
            )

            heroes = []
            for o in response.objects:
                heroes.append(
                    Hero(
                        name=o.properties["name"],
                        description=o.properties["description"],
                        failure=o.properties["failure"],
                        source=o.properties["source"],
                        certainty=o.metadata.certainty,
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
                self.client.close()
                logger.info("Weaviate client closed successfully")
            except Exception as e:
                logger.error(f"Error closing Weaviate client: {e}")

    def __del__(self):
        self.close()


if __name__ == "__main__":
    csv_path = "../data/output.csv"
    db = VectorDB()
    try:
        db.import_data(csv_path)
        heros = db.query_collection("お金を無駄遣いしてしまった", 10)
        pprint(heros)
    finally:
        db.close()
