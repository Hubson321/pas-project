import azure.functions as func
import datetime
import json
import logging
import os
import uuid

from azure.data.tables import TableServiceClient
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from azure.storage.queue import (
    QueueServiceClient,
    BinaryBase64DecodePolicy,
    BinaryBase64EncodePolicy,
)
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

app = func.FunctionApp()

# Configure the Azure Table Storage and Azure Blob Storage
try:
    PHOTOS_QUEUE_URL = os.environ["ENV_PHOTOS_QUEUE_URL"]
    PHOTOS_TABLE_URL = os.environ["ENV_PHOTOS_TABLE_URL"]
    PHOTOS_CONTAINER_URL = os.environ["ENV_PHOTOS_CONTAINER_URL"]
    PHOTOS_TABLE_NAME = os.environ["ENV_PHOTOS_TABLE_NAME"]
    PHOTOS_QUEUE_NAME = os.environ["ENV_PHOTOS_QUEUE_NAME"]
    PHOTOS_CONTAINER_NAME = os.environ["ENV_PHOTOS_CONTAINER_NAME"]
    PHOTOS_PRIMARY_KEY = os.environ["ENV_PHOTOS_PRIMARY_KEY"]
    CREDENTIALS = {
        "account_name": os.environ["ENV_PHOTOS_ACCOUNT_NAME"],
        "account_key": PHOTOS_PRIMARY_KEY,
    }
    PHOTOS_CONNSTRING = os.environ["ENV_PHOTOS_CONNSTR"]
    CV_ENDPOINT = os.environ["ENV_COGNITIVE_URL"]
    CV_KEY = os.environ["ENV_COGNITIVE_KEY"]
except KeyError as e:
    logging.error(f"Error: {e}")
    raise e


def generate_sas_token(image_name):
    blob_service_client = BlobServiceClient.from_connection_string(PHOTOS_CONNSTRING)
    blob_client = blob_service_client.get_blob_client(
        container=PHOTOS_CONTAINER_NAME, blob=image_name
    )
    token = generate_blob_sas(
        account_name=blob_client.account_name,
        container_name=blob_client.container_name,
        blob_name=blob_client.blob_name,
        account_key=PHOTOS_PRIMARY_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.datetime.now() + datetime.timedelta(hours=1),
    )
    return f"{blob_client.url}?{token}"

# Add CORS headers to allow requests from localhost:3000
def add_cors_headers(req: func.HttpRequest) -> func.HttpResponse:
    headers = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    return func.HttpResponse(status_code=200, headers=headers)

@app.function_name(name="post")
@app.route(route="post", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def post(req: func.HttpRequest) -> func.HttpResponse:
    """Post image from body to Azure Blob Storage and create an entry in Azure Table Storage"""
    try:
        table_service_client = TableServiceClient.from_connection_string(
            PHOTOS_CONNSTRING
        )
        table_client = table_service_client.get_table_client(PHOTOS_TABLE_NAME)
        blob_service_client = BlobServiceClient.from_connection_string(
            PHOTOS_CONNSTRING
        )
        queue_service_client = QueueServiceClient.from_connection_string(
            PHOTOS_CONNSTRING
        )
        queue_client = queue_service_client.get_queue_client(
            PHOTOS_QUEUE_NAME,
            message_encode_policy=BinaryBase64EncodePolicy(),
            message_decode_policy=BinaryBase64DecodePolicy(),
        )
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to connect to Azure Storage", status_code=500
        )

    logging.info(
        "Uploading a photo to Azure Blob Storage and creating an entry in Azure Table Storage"
    )
    if not req.get_body():
        return func.HttpResponse(
            "Please pass an image in the request body", status_code=400
        )

    try:
        body = req.get_body()
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to read the image from the request body", status_code=400
        )

    idx = str(uuid.uuid4())
    image_name = idx + ".png"

    try:
        blob_client = blob_service_client.get_blob_client(
            container=PHOTOS_CONTAINER_NAME, blob=image_name
        )
        blob_client.upload_blob(body, overwrite=True)
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to upload image to Azure Blob Storage", status_code=500
        )

    entity = {
        "PartitionKey": idx,
        "RowKey": idx,
        "Timestamp": datetime.datetime.now().isoformat(),
        "Url": blob_client.url,
        "State": "uploaded",
        "Result": False,
    }
    try:
        logging.info("upserting entity")
        table_client.upsert_entity(entity=entity)
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to create an entry in Azure Table Storage", status_code=500
        )

    # add message to the queue
    try:
        queue_client.send_message(idx.encode("utf-8"))
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to add a message to the Azure Queue", status_code=500
        )

    return func.HttpResponse(
        json.dumps(entity),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )

@app.function_name(name="list")
@app.route(route="list", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def list(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request.")

    try:
        table_service_client = TableServiceClient.from_connection_string(
            PHOTOS_CONNSTRING
        )
        table_client = table_service_client.get_table_client(PHOTOS_TABLE_NAME)
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to connect to Azure Storage", status_code=500
        )

    logging.info(f"Connected to Azure Table Storage: {PHOTOS_TABLE_NAME}")

    # read all entities from the table
    entities = []
    try:
        for entity in table_client.list_entities():
            entities.append(entity)
        logging.warn(f"Entities: {entities}")
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            "Error: Unable to read entities from Azure Table Storage", status_code=500
        )
    return func.HttpResponse(
        json.dumps({"list": entities}),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )

list_func = func.HttpResponse(func.HttpRequest, methods=["GET"], route="list")
list_func.add(add_cors_headers)


# Process an id from queue with Azure Cognitive Services image recognition
@app.function_name(name="process")
@app.queue_trigger(queue_name=PHOTOS_QUEUE_NAME, connection="ENV_PHOTOS_CONNSTR", arg_name="msg")
def process(msg: func.QueueMessage) -> None:
    idx = msg.get_body().decode("utf-8")
    logging.info("Processing image from the queue.")

    try:
        table_service_client = TableServiceClient.from_connection_string(PHOTOS_CONNSTRING)
        table_client = table_service_client.get_table_client(PHOTOS_TABLE_NAME)
        credentials = CognitiveServicesCredentials(CV_KEY)
        cv_service_client = ComputerVisionClient(CV_ENDPOINT, credentials)
    except Exception as e:
        logging.error(f"Error: {e}")
        raise e

    try:
        entity = table_client.get_entity(partition_key=idx, row_key=idx)
    except Exception as e:
        logging.error(f"Error: {e}")
        raise e

    if not entity:
        return

    try:
        sas_token = generate_sas_token(idx + ".png")
        analysis = cv_service_client.analyze_image(sas_token, [VisualFeatureTypes.tags])
        tags = [tag.name for tag in analysis.tags if tag.confidence > 0.8]
    except Exception as e:
        logging.error(f"Error: {e}")
        raise e

    entity["State"] = "processed"
    entity["Result"] = "hotdog" in tags
    entity["Tags"] = tags

    try:
        table_client.upsert_entity(entity=entity)
    except Exception as e:
        logging.error(f"Error: {e}")
        raise e

@app.function_name(name="get_counters")
@app.route(route="get_counters", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def get_counters(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Getting counters from Azure Table Storage.")

    try:
        table_service_client = TableServiceClient.from_connection_string(PHOTOS_CONNSTRING)
        table_client = table_service_client.get_table_client(PHOTOS_TABLE_NAME)
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse("Error: Unable to connect to Azure Storage", status_code=500)

    counters = {}

    try:
        entities = table_client.list_entities()
        for entity in entities:
            entity = dict(entity)
            for tag in entity.get("Tags", []):
                if tag in counters:
                    counters[tag] += 1
                else:
                    counters[tag] = 1
        logging.info(f"Counters: {counters}")
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse("Error: Unable to read entities from Azure Table Storage", status_code=500)

    return func.HttpResponse(json.dumps({"counters": counters}), status_code=200, headers={"Content-Type": "application/json"})
