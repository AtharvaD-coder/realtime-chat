'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../../socket'; 

import { User, Message } from '../types/types';

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user] = useState<User>({
    id: uuidv4(),
    name: `User${Math.floor(Math.random() * 1000)}`,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    
    socket.on('message', (message: Message) => {
      console.log('📩 New message received:', message);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [page]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?page=${page}`);
      const data = await res.json();
      console.log('📜 Fetched messages:', data);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages((prev) => [...messagesArray.reverse(), ...prev]);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const message: Message = {
      id: uuidv4(),
      content: newMessage,
      sender: user.name,
      timestamp: new Date(),
    };

    console.log('✉️ Sending message:', message);

    
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    
    socket.emit('message', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user.name ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  message.sender === user.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{message.sender}</div>
                <div>{message.content}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>

      <div className="p-4 text-center">
        <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
        <p>Transport: {transport}</p>
      </div>
    </div>
  );
};

export default ChatRoom;
