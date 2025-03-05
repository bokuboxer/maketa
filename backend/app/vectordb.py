import weaviate
import weaviate.classes.config as wc
import weaviate.classes.query as wq
import weaviate.connect as wcon
import os
from weaviate.util import generate_uuid5
import pandas as pd
from tqdm import tqdm
from pprint import pprint

from app.schema import Hero


class VectorDB:
    def __init__(self, port: int = 8080, grpc_port: int = 50051):
        self.port = port
        self.grpc_port = grpc_port
        self.client = self._create_client()
        self.client.connect()
        self._create_collection()

    def _create_client(self):
        api_key = os.environ.get("OPENAI_API_KEY", "")
        headers = {"X-OpenAI-Api-Key": api_key}

        # Docker環境ではサービス名で接続
        host = "weaviate" if os.getenv("ENVIRONMENT") == "development" else "localhost"

        client = weaviate.WeaviateClient(
            connection_params=wcon.ConnectionParams(
                http={
                    "host": host,
                    "port": self.port,
                    "secure": False,  # 開発環境ではHTTPを使用
                },
                grpc={
                    "host": host,
                    "port": self.grpc_port,
                    "secure": False,  # 開発環境ではgRPCも非セキュア
                },
            ),
            additional_headers=headers,
        )
        return client

    def _create_collection(self):
        if not self.client.collections.exists("Hero"):
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
                self.client.connect()

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
            return heroes
        except Exception as e:
            print(f"Error querying collection: {e}")
            return None

    def close(self):
        if hasattr(self, "client"):
            self.client.close()

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
