import { useState, useRef, useEffect } from "react";
import backgroundImage from './chat-bot-background.png';
import React from "react";

// Retrieve the token from environment variables
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN; 
const MODEL_NAME = "unsloth/Meta-Llama-3.1-8B-Instruct:featherless-ai";

// Simple Typing Indicator Component
const TypingIndicator = () => (
    <div style={{ 
        display: "flex", 
        justifyContent: "flex-start" 
    }}>
        <div style={{
            background: "#e5e7eb",
            color: "#222",
            borderRadius: 18,
            padding: "10px 18px",
            maxWidth: 260,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            fontSize: 16,
            wordBreak: "break-word"
        }}>
            Assistant is typing...
        </div>
    </div>
);


export default function ChatPage() {
    
  // State Initialization
  const [messages, setMessages] = useState([
    { sender: "bot", text: "I'm here for you! Ask me anything." } 
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  async function handleSend() {
    if (!input.trim() || isTyping) return;

    const userMsg = { sender: "user", text: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    
    setIsTyping(true);

    const botReplyContent = await fetchHuggingFaceReply(newMessages); 

    setIsTyping(false);
    
    const botReply = { sender: "bot", text: botReplyContent }; 
    setMessages((prev) => [...prev, botReply]);
  }

  // --- API Communication Logic ---
  async function fetchHuggingFaceReply(conversationHistory) {
    
    const apiMessages = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant', 
        content: msg.text 
    }));

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            messages: apiMessages,  
            model: MODEL_NAME,     
            max_tokens: 512,
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return `API Error ${response.status}: ${errorData.error || 'Unknown API error. Check token and model name.'}`; 
      }
      
      const data = await response.json();
      
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      
      return `Unexpected API structure: ${JSON.stringify(data)}`;
    } catch (err) {
      return `Fetch error: ${err.message}`;
    }
  }

  // --- JSX Design with Background Image ---
  return (
    // 🌟 BACKGROUND IMAGE ADDED HERE 🌟
    <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh", 
        backgroundImage:  `url(${backgroundImage})`,
        backgroundSize: "cover", // Ensures image covers the entire area
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat" // Prevents image repetition
    }}>
        <div style={{ width: "100%", maxWidth: 420, background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", minHeight: 500 }}>
            
            <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px', color: '#2563eb' }}>
                Welcome! 🤖
            </h1>
            
            {/* Token Warning */}
            {!HF_TOKEN && (
                <div style={{padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '16px', textAlign: 'center'}}>
                    **Error:** HF\_TOKEN is missing. Please check your .env file.
                </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                            background: msg.sender === "user" ? "#2563eb" : "#e5e7eb",
                            color: msg.sender === "user" ? "white" : "#222",
                            borderRadius: 18,
                            padding: "10px 18px",
                            maxWidth: 260,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            fontSize: 16,
                            wordBreak: "break-word"
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && <TypingIndicator />}
                
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 18, padding: "10px 16px", outline: "none", fontSize: 16 }}
                    placeholder="Type a message..."
                    disabled={!HF_TOKEN || isTyping}
                />
                <button
                    onClick={handleSend}
                    style={{ 
                        background: (HF_TOKEN && !isTyping) ? "#2563eb" : "#ccc", 
                        color: "white", 
                        padding: "10px 18px", 
                        borderRadius: 18, 
                        border: "none", 
                        fontWeight: 500, 
                        cursor: (HF_TOKEN && !isTyping) ? "pointer" : "not-allowed" 
                    }}
                    disabled={!HF_TOKEN || isTyping}
                >
                    Send
                </button>
            </div>
        </div>
    </div>
  );
}