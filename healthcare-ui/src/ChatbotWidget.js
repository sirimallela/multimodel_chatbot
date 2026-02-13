import React, { useState } from "react";

const SYMPTOM_FAMILIES = {
  fever: ["high fever", "mild fever"],
  pain: [
    "headache",
    "chest pain",
    "stomach pain",
    "abdominal pain",
    "back pain",
    "joint pain",
    "neck pain"
  ],
  vision: [
    "blurred vision",
    "visual disturbances"
  ],
  urine: [
    "dark urine",
    "yellow urine",
    "burning urination"
  ]
};


export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 Tell me your symptoms in a sentence." }
  ]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("symptoms"); 
  const [symptomText, setSymptomText] = useState("");
  const [days, setDays] = useState("");
  const [pendingFamily, setPendingFamily] = useState(null);

  const handleQuickReply = (value) => {
    setInput(value);
    setTimeout(() => sendMessage(), 100);
    };


  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(m => [...m, { from: "user", text: userMsg }]);
    setInput("");

    // -------- STAGE: symptoms ----------
    if (stage === "symptoms") {
    setSymptomText(userMsg);
    const text = userMsg.toLowerCase();

    // detect ambiguous family
    for (const key of Object.keys(SYMPTOM_FAMILIES)) {
        if (text.includes(key)) {
        setPendingFamily(key);

        setMessages(m => [...m, {
        from: "bot",
        text: `Which type of ${key}?`,
        options: SYMPTOM_FAMILIES[key]
        }]);


        setStage("family_clarify");
        return;
        }
    }

    // no ambiguity → go days
    setMessages(m => [...m, {
        from: "bot",
        text: "How many days have you had these symptoms?"
    }]);

    setStage("days");
    return;
    }

    // -------- STAGE: family clarification ----------
    if (stage === "family_clarify") {
    setSymptomText(prev => prev + " " + userMsg.toLowerCase());
    setPendingFamily(null);

    setMessages(m => [...m, {
        from: "bot",
        text: "How many days have you had these symptoms?"
    }]);

    setStage("days");
    return;
    }



    // -------- STAGE 3: days ----------
    if (stage === "days") {
    setDays(userMsg);

    setMessages(m => [...m, {
        from: "bot",
        text: "Analyzing symptoms..."
    }]);

    try {
        const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            symptoms: [],
            text: symptomText,
            days: parseInt(userMsg) || 1,
            age: 0
        })
        });

        const data = await res.json();
        console.log("API response:", data);

        // ✅ SAME STRUCTURE USED BY YOUR ANALYZE PAGE
        if (data?.diseases && data.diseases.length > 0) {
        const d = data.diseases[0];

        const confidence =
            d.confidence > 1
            ? d.confidence.toFixed(2)
            : (d.confidence * 100).toFixed(2);

        // disease + confidence
        setMessages(m => [...m, {
            from: "bot",
            text: `🩺 ${d.name || d.disease} (${confidence}%)`
        }]);

        // description
        if (d.description) {
            setMessages(m => [...m, {
            from: "bot",
            text: d.description
            }]);
        }

        // precautions
        if (d.precautions && d.precautions.length > 0) {
            setMessages(m => [...m, {
            from: "bot",
            text: "Recommended precautions:"
            }]);

            d.precautions.forEach(p => {
            setMessages(m => [...m, {
                from: "bot",
                text: "• " + p
            }]);
            });
        }

        } else {
        setMessages(m => [...m, {
            from: "bot",
            text: "No prediction found."
        }]);
        }

    } catch (err) {
        setMessages(m => [...m, {
        from: "bot",
        text: "Server error. Try again."
        }]);
    }

    // allow next prediction
    setTimeout(() => {
    setMessages(m => [...m, {
        from: "bot",
        text: "You can enter new symptoms to check again."
    }]);
    setStage("symptoms");   // 🔥 reset flow
    }, 500);

    return;

    }


  };

  return (
    <>
        {/* Floating Button */}
        <button
        onClick={() => setOpen(!open)}
        style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            borderRadius: "50%",
            width: 64,
            height: 64,
            border: "none",
            cursor: "pointer",
            fontSize: 26,
            background: "linear-gradient(135deg,#0d9488,#2563eb)",
            color: "white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            zIndex: 9999
        }}
        >
        💬
        </button>

        {/* Chat Window */}
        {open && (
            <div style={{
                position: "fixed",
                bottom: 110,
                right: 24,
                width: 460,     // ⬅️ bigger width
                height: 620,    // ⬅️ bigger height
                background: "#ffffff",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                overflow: "hidden",
                zIndex: 9999
            }}>


            {/* Header */}
            <div style={{
            background: "linear-gradient(135deg,#0d9488,#2563eb)",
            color: "white",
            padding: "14px 16px",
            fontWeight: "bold",
            fontSize: 20,
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
            }}>
            Health Assistant
            <span
                onClick={() => setOpen(false)}
                style={{ cursor: "pointer", fontSize: 18 }}
            >
                ✕
            </span>
            </div>

            {/* Messages */}
            <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 14,
            background: "#f3f6fb"
            }}>
            {messages.map((m, i) => (
                <div key={i} style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: 10
                }}>
                <div style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: 16,
                    lineHeight: 1.4,
                    background:
                    m.from === "user"
                        ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                        : "#ffffff",
                    color: m.from === "user" ? "white" : "#111",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                }}>
                    {m.text}

                    {m.options && (
                    <div style={{
                        marginTop: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8
                    }}>
                        {m.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickReply(opt)}
                            style={{
                            padding: "8px 12px",
                            borderRadius: 18,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                            background: "#e0f2fe",
                            color: "#0369a1"
                            }}
                        >
                            {opt}
                        </button>
                        ))}
                    </div>
                    )}

                </div>
                </div>
            ))}
            </div>

            {/* Input */}
            <div style={{
            display: "flex",
            padding: 10,
            borderTop: "1px solid #e5e7eb",
            background: "white"
            }}>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your symptoms..."
                style={{
                flex: 1,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "14px 14px",
                fontSize: 15,
                outline: "none"
                }}
            />
            <button
                onClick={sendMessage}
                style={{
                marginLeft: 8,
                borderRadius: 10,
                border: "none",
                padding: "10px 16px",
                fontWeight: "bold",
                cursor: "pointer",
                background: "linear-gradient(135deg,#0d9488,#2563eb)",
                color: "white"
                }}
            >
                Send
            </button>
            </div>

        </div>
        )}
    </>
    );

}
