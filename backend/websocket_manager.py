from typing import Dict, List, Set
from fastapi import WebSocket
from datetime import datetime
import json

class ConnectionManager:
    """WebSocket connection manager for chat rooms."""
    
    def __init__(self):
        self.active_connections: Dict[str, List[dict]] = {}  # room_id -> [{ws, user_info}]
    
    async def connect(self, websocket: WebSocket, room_id: str, user_info: dict):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append({"ws": websocket, "user": user_info})
    
    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id] = [
                c for c in self.active_connections[room_id] if c["ws"] != websocket
            ]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
    
    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_connections:
            disconnected = []
            for conn in self.active_connections[room_id]:
                try:
                    await conn["ws"].send_json(message)
                except Exception:
                    disconnected.append(conn)
            for conn in disconnected:
                self.active_connections[room_id].remove(conn)
    
    def get_rooms(self) -> List[str]:
        return list(self.active_connections.keys())
    
    def get_room_users(self, room_id: str) -> List[dict]:
        if room_id in self.active_connections:
            return [c["user"] for c in self.active_connections[room_id]]
        return []

manager = ConnectionManager()
