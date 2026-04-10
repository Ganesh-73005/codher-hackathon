from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "codher_hackathon")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def init_db():
    """Create indexes for performance."""
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username")
    await db.teams.create_index("team_id", unique=True)
    await db.mentors.create_index("mentor_id", unique=True)
    await db.mentors.create_index("mentor_email", unique=True)
    await db.evaluations.create_index([("team_id", 1), ("round_name", 1), ("mentor_id", 1)])
    await db.chat_messages.create_index([("room_id", 1), ("timestamp", 1)])
    await db.email_logs.create_index("sent_at")
    await db.sync_logs.create_index("timestamp")
    await db.submissions.create_index([("team_id", 1), ("round_name", 1)])
