// src/pages/Chatbot/ChatbotPage.js
import React, { useState, useRef, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const ChatbotPage = () => {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    {
      id: 1,
      from: "bot",
      text: "🌱 **Welcome to AgroTrust AI Assistant!**\n\nI can help you with:\n• Crop prices & market info\n• Farming techniques & advice\n• Subsidy information\n• Crop disease diagnosis\n• Government support\n\n**Ask me anything or upload a crop photo for AI analysis!**",
      timestamp: new Date(),
    }
  ]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErr("Image size should be less than 5MB");
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Add image preview to chat
      setChat(prev => [...prev, {
        id: Date.now(),
        from: "me",
        text: "Uploaded crop image for analysis",
        image: reader.result,
        timestamp: new Date(),
      }]);
      
      // Clear file input
      e.target.value = "";
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.includes('**') && line.includes('**')) {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} dangerouslySetInnerHTML={{ __html: boldText }} style={{ margin: '4px 0' }} />;
      }
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={index} style={{ marginLeft: '20px', margin: '2px 0' }}>{line}</div>;
      }
      return <p key={index} style={{ margin: '4px 0' }}>{line}</p>;
    });
  };

  const sendMessage = async () => {
    if (!msg.trim() && !image) return;
    
    const userText = msg.trim();
    const userMessage = {
      id: Date.now(),
      from: "me",
      text: userText,
      image: imagePreview,
      timestamp: new Date(),
    };
    
    setChat(prev => [...prev, userMessage]);
    setMsg("");
    setImage(null);
    setImagePreview(null);
    setErr("");
    setLoading(true);

    try {
      // Convert image to base64 if present
      let imageBase64 = null;
      if (image) {
        const reader = new FileReader();
        reader.onload = () => {
          imageBase64 = reader.result;
          sendToAPI(userText, imageBase64);
        };
        reader.readAsDataURL(image);
      } else {
        sendToAPI(userText, null);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      sendToAPI(userText, null);
    }
  };

  const sendToAPI = async (userText, imageBase64) => {
    try {
      const payload = { message: userText };
      if (imageBase64) {
        payload.image = imageBase64;
      }

      const res = await api.post("/chatbot/ask", payload);
      
      const botMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: res.data.reply,
        timestamp: new Date(),
      };
      
      setChat(prev => [...prev, botMessage]);
    } catch (e) {
      console.error("Chatbot error:", e);
      
      const errorMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: "⚠️ **Sorry, I'm having trouble connecting.**\n\nPlease try again or ask a different question.\n\nYou can also:\n1. Contact local DAE office\n2. Visit nearest Krishi Bazar\n3. Check government agricultural websites",
        timestamp: new Date(),
      };
      
      setChat(prev => [...prev, errorMessage]);
      setErr(e.response?.data?.message || "Chatbot service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What's the rice price?",
    "How to apply for subsidy?",
    "Tell me about potato farming",
    "Common crop diseases?",
    "Weather advice for farmers",
    "Best fertilizer for rice?",
  ];

  const handleQuickQuestion = (question) => {
    setMsg(question);
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">AgroTrust AI Assistant</h1>
            <p className="subhead">
              Get farming advice, crop prices, subsidy info, and disease diagnosis
            </p>
          </div>
          <div className="hero-actions">
            <button 
              className="btn" 
              onClick={() => setChat([{
                id: 1,
                from: "bot",
                text: "🌱 **Welcome to AgroTrust AI Assistant!**\n\nI can help you with:\n• Crop prices & market info\n• Farming techniques & advice\n• Subsidy information\n• Crop disease diagnosis\n• Government support\n\n**Ask me anything or upload a crop photo for AI analysis!**",
                timestamp: new Date(),
              }])}
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">
          <h3 style={{ margin: 0 }}>Quick Questions</h3>
          <span className="mini">Click to ask</span>
        </div>
        <div className="chips" style={{ marginTop: 8 }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              className="chip"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ 
        minHeight: 400, 
        maxHeight: 500, 
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}>
        {chat.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              backgroundColor: m.from === "me" ? "#f0f9ff" : "#f8fafc",
              border: `1px solid ${m.from === "me" ? "#bae6fd" : "#e2e8f0"}`,
              alignSelf: m.from === "me" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: 8,
              gap: 8 
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: m.from === "me" ? "#3b82f6" : "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 14
              }}>
                {m.from === "me" ? "You" : "🤖"}
              </div>
              <div>
                <strong>{m.from === "me" ? "You" : "AgroTrust AI"}</strong>
                <div className="mini" style={{ marginTop: 2 }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              {formatMessage(m.text)}
              
              {m.image && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={m.image}
                    alt="Uploaded crop"
                    style={{
                      maxWidth: 200,
                      maxHeight: 150,
                      borderRadius: 8,
                      border: "1px solid var(--border)"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            alignSelf: "flex-start",
            maxWidth: "80%",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 14
              }}>
                🤖
              </div>
              <strong>AgroTrust AI</strong>
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: "#3b82f6",
                animation: "pulse 1.5s infinite"
              }} />
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: "#3b82f6",
                animation: "pulse 1.5s infinite",
                animationDelay: "0.2s"
              }} />
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: "#3b82f6",
                animation: "pulse 1.5s infinite",
                animationDelay: "0.4s"
              }} />
              <span style={{ marginLeft: 8 }}>Analyzing...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="card" style={{ marginTop: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Image Ready for Analysis</strong>
              <div className="mini">Crop photo uploaded</div>
            </div>
            <button className="btn btn-danger" onClick={removeImage}>Remove</button>
          </div>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              marginTop: 12,
              maxWidth: 150,
              maxHeight: 100,
              borderRadius: 8,
              border: "1px solid var(--border)"
            }}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="card" style={{ marginTop: 10 }}>
        {err && <div className="error" style={{ marginBottom: 12 }}>{err}</div>}
        
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <textarea
              className="input"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crops, prices, diseases, subsidies..."
              rows={3}
              style={{ resize: "vertical", minHeight: 60 }}
            />
            
            <div className="mini" style={{ marginTop: 6, color: "var(--muted)" }}>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={loading || (!msg.trim() && !image)}
              style={{ minWidth: 100 }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: "none" }}
              id="image-upload"
            />
            
            <button
              className="btn"
              onClick={() => fileInputRef.current?.click()}
              style={{ minWidth: 100 }}
            >
              📷 Upload
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">
          <h3 style={{ margin: 0 }}>💡 Tips for Best Results</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          <div>
            <strong>🌾 For Crop Advice:</strong>
            <ul style={{ margin: "8px 0 0 20px", padding: 0, fontSize: "0.9em" }}>
              <li>Mention crop name and variety</li>
              <li>Include your location</li>
              <li>Specify season/time of year</li>
            </ul>
          </div>
          <div>
            <strong>🏥 For Disease Diagnosis:</strong>
            <ul style={{ margin: "8px 0 0 20px", padding: 0, fontSize: "0.9em" }}>
              <li>Upload clear photos of affected leaves</li>
              <li>Show both sides of leaves</li>
              <li>Include whole plant if possible</li>
            </ul>
          </div>
          <div>
            <strong>💰 For Market Info:</strong>
            <ul style={{ margin: "8px 0 0 20px", padding: 0, fontSize: "0.9em" }}>
              <li>Ask for specific crop prices</li>
              <li>Mention your district/area</li>
              <li>Ask about market trends</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ChatbotPage;