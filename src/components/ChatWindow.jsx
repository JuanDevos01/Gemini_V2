import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MDEditor from "@uiw/react-md-editor";
import InputBox from "./InputBox";

import "../assets/ChatWindow.css"; 
import logo from "../assets/img/gemini-small.png";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const Header = () => {
  return (
    <div className="header">
      <h1 id="chat-header">
        <img src={logo} alt="gemini" width={120} />
        <b style={{ marginLeft: 5 }}>NoraCloud Assistant</b>
      </h1>
      <small>Powered by Google’s largest and most capable AI model</small>
    </div>
  );
};

const ChatWindow = () => {
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { // Initial welcome message
      text: "Hi! I'm Nora, your virtual assistant for NoraCloud. How can I help you today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);
// useEffect(() => {
//     // Automatically introduce Nora when the chat window loads
//     setMessages([
//       {
//         text: "Hola, mi nombre es Nora y soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
//         sender: "ai",
//         timestamp: new Date(),
//       },
//     ]);
//   }, []);
  const sendMessage = async (inputText) => {
    if (!inputText) {
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, sender: "user", timestamp: new Date() },
    ]);

    setLoading(true);

    try {
      // Model generation with focus on Nora's role
      const prompt = `As Nora, the helpful NoraCloud virtual assistant, respond to this user query: ${inputText} `; 
      const result = await model.generateContent(prompt); 
      const text = result.response.text();

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: text,
          sender: "ai",
          timestamp: new Date(),
          isCode: text.includes("```"),
        },
      ]);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("generateContent error: ", error);
    }
  };

  return (
    <div className={`chat-window`}>
      <Header />
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === "user" ? "user" : "ai"}`}
          >
            {message.isCode ? (
              <MDEditor.Markdown
                source={message.text}
                style={{ whiteSpace: "pre-wrap" }}
              />
            ) : (
              <>
                <p className="message-text">{message.text}</p>
                <span
                  className={`time ${
                    message.sender === "user" ? "user" : "ai"
                  }`}
                >
                  {message.timestamp
                    ? dayjs(message.timestamp).format("DD.MM.YYYY HH:mm:ss")
                    : ""}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <InputBox sendMessage={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;