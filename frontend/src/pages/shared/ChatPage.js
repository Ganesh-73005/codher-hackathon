import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, getAccessToken, getWsUrl } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import { Send, MessageCircle, Users } from 'lucide-react';

export default function ChatPage({ isAdmin = false }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const fetchRooms = useCallback(async () => {
    try {
      const data = await api('/api/chat/rooms');
      setRooms(data.rooms);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const fetchMessages = async (roomId) => {
    try {
      const data = await api(`/api/chat/messages/${roomId}`);
      setMessages(data.messages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { console.error(err); }
  };

  const connectWebSocket = (roomId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const token = getAccessToken();
    const wsUrl = getWsUrl(`/api/ws/chat/${roomId}?token=${token}`);
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    wsRef.current = ws;
  };

  const selectRoom = (room) => {
    setActiveRoom(room);
    fetchMessages(room._id);
    connectWebSocket(room._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: newMessage }));
    } else {
      await api('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ room_id: activeRoom._id, content: newMessage }),
      });
      fetchMessages(activeRoom._id);
    }
    setNewMessage('');
  };

  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>
          {isAdmin ? 'Chat Monitor' : 'Chat'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Monitor and join team-mentor conversations' : 'Communicate with your assigned contacts'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Rooms List */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-340px)]" data-testid="chat-conversation-list">
              {loading ? (
                <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 skeleton-shimmer rounded-lg" />)}</div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-0.5 p-2">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      onClick={() => selectRoom(room)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${activeRoom?._id === room._id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{room.team_name || room.team_id}</p>
                        {room.unread_count > 0 && <Badge className="text-xs h-5 min-w-[20px] flex items-center justify-center">{room.unread_count}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{room.mentor_email}</p>
                      {room.last_message && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{room.last_message.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Thread */}
        <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col">
          {activeRoom ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{activeRoom.team_name || activeRoom.team_id}</CardTitle>
                    <p className="text-xs text-muted-foreground">{activeRoom.mentor_email}</p>
                  </div>
                  {isAdmin && (
                    <Badge variant="secondary" className="ml-auto" data-testid="chat-join-button">Admin View</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} data-testid="chat-thread">
                  <div className="space-y-3">
                    {messages.map((msg, i) => {
                      const isMine = msg.sender_email === user?.email;
                      return (
                        <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`chat-message-bubble ${isMine ? 'chat-message-sent' : 'chat-message-received'}`}>
                            {!isMine && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {msg.sender_name} {msg.sender_role === 'admin' ? '(Admin)' : ''}
                              </p>
                            )}
                            <p>{msg.content}</p>
                            <p className="text-xs mt-1 opacity-50">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-3 border-t flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    data-testid="chat-message-input"
                  />
                  <Button onClick={sendMessage} size="icon" className="btn-press" data-testid="chat-send-button">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
