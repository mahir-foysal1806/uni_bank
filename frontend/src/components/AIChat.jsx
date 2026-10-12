import { useState } from "react";
import { Link } from "react-router-dom";
import "./AIChat.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const suggestions = [
  "Python কী এবং কেন ব্যবহার করা হয়?",
  "Recursion সহজভাবে বুঝিয়ে দাও",
  "Database কীভাবে কাজ করে?",
  "আমার জন্য ৭ দিনের study plan বানাও",
];

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "AI request failed."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.reply ||
            "দুঃখিত, কোনো response পাওয়া যায়নি।",
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "দুঃখিত, এই মুহূর্তে AI response পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (text) => {
    setMessage(text);
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([]);
    setMessage("");
  };

  return (
    <div className="uniq-ai-page">
      <div className="uniq-ai-container">

        {/* Header */}
        <header className="uniq-ai-header">
          <div>
            <div className="uniq-ai-eyebrow">
              UNIQBANK AI
            </div>

            <h1>
              Study smarter with AI.
            </h1>

            <p>
              Ask questions, understand difficult
              topics, and get help with your
              university studies.
            </p>
          </div>

          <div className="uniq-ai-header-actions">
            {messages.length > 0 && (
              <button
                type="button"
                className="uniq-ai-clear"
                onClick={clearChat}
                disabled={loading}
              >
                Clear chat
              </button>
            )}

            <Link
              to="/"
              className="uniq-ai-back"
            >
              ← Home
            </Link>
          </div>
        </header>

        {/* AI Status */}
        <div className="uniq-ai-status">
          <div className="uniq-ai-status-left">
            <div className="uniq-ai-logo">
              ✦
            </div>

            <div>
              <strong>
                UniQBank AI
              </strong>

              <span>
                Your academic study assistant
              </span>
            </div>
          </div>

          <div className="uniq-ai-online">
            <span />
            Online
          </div>
        </div>

        {/* Chat */}
        <section className="uniq-ai-chat">

          {messages.length === 0 ? (
            <div className="uniq-ai-welcome">

              <div className="uniq-ai-welcome-icon">
                ✦
              </div>

              <div className="uniq-ai-welcome-label">
                ASK UNIQBANK AI
              </div>

              <h2>
                How can I help you?
              </h2>

              <p>
                Ask me anything about your studies,
                programming, assignments or
                university subjects.
              </p>

              <div className="uniq-ai-suggestions">

                <div className="uniq-ai-suggestions-title">
                  Try asking
                </div>

                <div className="uniq-ai-suggestion-list">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="uniq-ai-suggestion"
                        onClick={() =>
                          useSuggestion(suggestion)
                        }
                      >
                        <span>
                          {suggestion}
                        </span>

                        <b>→</b>
                      </button>
                    )
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="uniq-ai-messages">

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`uniq-ai-message ${
                    msg.role === "user"
                      ? "uniq-ai-user"
                      : "uniq-ai-assistant"
                  }`}
                >

                  <div className="uniq-ai-avatar">
                    {msg.role === "user"
                      ? "You"
                      : "AI"}
                  </div>

                  <div className="uniq-ai-message-content">

                    <div className="uniq-ai-message-name">
                      {msg.role === "user"
                        ? "You"
                        : "UniQBank AI"}
                    </div>

                    <div className="uniq-ai-message-text">
                      {msg.content}
                    </div>

                  </div>
                </div>
              ))}

              {loading && (
                <div className="uniq-ai-message uniq-ai-assistant">

                  <div className="uniq-ai-avatar">
                    AI
                  </div>

                  <div className="uniq-ai-message-content">

                    <div className="uniq-ai-message-name">
                      UniQBank AI
                    </div>

                    <div className="uniq-ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </section>

        {/* Input */}
        <form
          className="uniq-ai-input-card"
          onSubmit={sendMessage}
        >
          <div className="uniq-ai-input-row">

            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ask UniQBank AI anything..."
              disabled={loading}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={
                loading || !message.trim()
              }
            >
              {loading ? "Thinking..." : "Send"}
            </button>

          </div>

          <div className="uniq-ai-input-bottom">
            <span>
              UniQBank AI
            </span>

            <span>
              Press Enter to send
            </span>
          </div>
        </form>

        {/* Disclaimer */}
        <div className="uniq-ai-disclaimer">
          <span>ⓘ</span>

          <p>
            AI responses may contain mistakes.
            Always verify important academic
            information before using it.
          </p>
        </div>

      </div>
    </div>
  );
}

export default AIChat;