import json
import os

from bson import ObjectId
from pymongo import MongoClient

client = MongoClient(os.environ["MONGO_URI"])  # connects to the MongoDB cluster
db = client["noticeboard_DB"]  # chooses noticeboard_DB database
notices_coll = db["notices"]  # chooses notices collection in that database


def lambda_handler(event, context):
    try:
        http_method = event["requestContext"]["http"]["method"]
        path_parameters = event.get("pathParameters") or {}
        notice_id = path_parameters.get("id")

        body = {}
        if event.get("body"):
            body = json.loads(event["body"])

        # GET
        if http_method == "GET":
            # Pulling for specific notice id
            if notice_id:
                notice = notices_coll.find_one(
                    {"_id": ObjectId(notice_id)}
                )

                # If notice not found from id, returns 404
                if not notice:
                    return {
                        "statusCode": 404,
                        "body": json.dumps({"message": "Notice not found"})
                    }

                # If notice is found from id, returns title and contents from that notice
                return {
                    "statusCode": 200,
                    "body": json.dumps(notice, default=str)
                }

            # Returns all notices from db
            notices = list(notices_coll.find())

            return {
                "statusCode": 200,
                "body": json.dumps(notices, default=str)
            }

        # POST
        # If the HTTP request is POST, create a new notice with a title and content
        if http_method == "POST":
            new_notice = {
                "title": body.get("title", "Untitled"),
                "content": body.get("content", "")
            }

            # Adds the new notice to the notices collection in db
            result = notices_coll.insert_one(new_notice)

            # Returns 201 Created and the id of the new notice
            return {
                "statusCode": 201,
                "body": json.dumps({
                    "id": str(result.inserted_id),
                    "message": "Notice created"
                })
            }

        # PUT
        # If request is PUT and has a notice id, update its title and content
        if http_method == "PUT" and notice_id:
            update_data = {
                "title": body.get("title"),
                "content": body.get("content")
            }

            # Finds the notice with the given id and updates its fields
            notices_coll.update_one(
                {"_id": ObjectId(notice_id)},
                {"$set": update_data}
            )

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Notice updated"})
            }

        # DELETE
        # Deletes the entire notice with the given notice id
        if http_method == "DELETE" and notice_id:
            notices_coll.delete_one(
                {"_id": ObjectId(notice_id)}
            )

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Notice deleted"})
            }

        # Runs if the request doesn't match one of the supported requests
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Unsupported request"})
        }

    # Runs if an unexpected error happens
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }