"use client";
// App.tsx
// import "@/app/(app)/globals.css";
import { createChat } from "@n8n/chat";
import "@n8n/chat/style.css";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    createChat({
      webhookUrl: "https://n8n.srv986339.hstgr.cloud/webhook/810fe12a-3096-4dc2-a9ae-f0590ba878f5/chat",
      webhookConfig: {
        method: "POST",
        headers: {},
      },
      target: "#n8n-chat",
      mode: "window",
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: "en",
      initialMessages: [
        "Hi there! 👋",
        "How can I assist you today? You can ask me about our services, our projects, or anything else you need help with. You can always book a meeting with us in this chatbot.",
      ],
      i18n: {
        en: {
          title: "Visual EmotionWork Chatbot",
          subtitle: "Start a chat. We're here to help you 24/7.",
          footer: "",
          getStarted: "New Conversation",
          inputPlaceholder: "Type your question..",
          closeButtonTooltip: "Close chat",
        },
      },
      enableStreaming: false,
    });
  }, []);

  return <div></div>;
};

export default App;
