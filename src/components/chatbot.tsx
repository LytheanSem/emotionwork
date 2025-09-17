"use client";
// App.tsx
// import "@/app/(app)/globals.css";
import { createChat } from "@n8n/chat";
import "@n8n/chat/style.css";
import { useEffect, useState } from "react";

const App = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as { _n8nChat?: unknown })._n8nChat) return; // dev strict-mode guard

    // Delay chatbot initialization to improve initial page load
    const timer = setTimeout(() => {
      try {
        const instance = createChat({
          webhookUrl: "https://n8n.srv986339.hstgr.cloud/webhook/810fe12a-3096-4dc2-a9ae-f0590ba878f5/chat",
          webhookConfig: {
            method: "POST",
            headers: {},
          },
          mode: "window",
          chatInputKey: "chatInput",
          chatSessionKey: "sessionId",
          loadPreviousSession: false, // Disable to prevent fetch errors
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

        (window as unknown as { _n8nChat?: unknown })._n8nChat = instance;
      } catch (error) {
        console.error("Failed to initialize chatbot:", error);
        setHasError(true);
      }
    }, 2000); // Delay chatbot initialization by 2 seconds

    return () => {
      clearTimeout(timer);
      try {
        (window as unknown as { _n8nChat?: unknown })._n8nChat = undefined;
      } catch (error) {
        console.error("Error cleaning up chatbot:", error);
      }
    };
  }, []);

  // Don't render if there's an error
  if (hasError) {
    return null;
  }

  return <div id="n8n-chat" className="n8n-chat" />;
};

export default App;
