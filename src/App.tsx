import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Model, Message } from "./types/types";
import { Navbar } from "./components/Navbar";
import { Chat } from "./components/Chat";
import { ChatInput } from "./components/ChatInput";

export default function App() {
    const [input, setInput] = useState("");
    const [inputDisabled, setInputDisabled] = useState(false);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [isDarkMode, setIsDarkMode] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("darkMode");
            return saved
                ? JSON.parse(saved)
                : window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });
    const focusTargetRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch("http://localhost:3000/models");
                const data = await response.json();
                const modelList: Model[] = data.models.models;
                setModels(modelList.map((model) => model.name));
                if (modelList.length > 0) {
                    setSelectedModel(modelList[0].name);
                }
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    function toggleDarkMode() {
        setIsDarkMode((prev: any) => !prev);
    }

    async function handleSendMessage() {
        if (!input.trim()) {
            return;
        }

        if (!selectedModel) {
            alert("Please select a model first!");
            return;
        }

        setInputDisabled(true);

        setMessages((prev) => [...prev, { role: "user", content: input }]);

        const userInput = input;
        setInput("");

        try {
            const response = await fetch("http://localhost:3000/ollama", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: selectedModel,
                    message: userInput,
                }),
            });

            if (!response.body) {
                console.error("Response body is empty");
                return;
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "" },
            ]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunkText = decoder.decode(value, { stream: true });
                const events = chunkText.split("\n\n");
                for (const event of events) {
                    if (event.startsWith("data: ")) {
                        const dataString = event.replace("data: ", "").trim();
                        if (dataString === "[DONE]") {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataString);
                            accumulatedText += parsed.chunk;

                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: "assistant",
                                    content: accumulatedText,
                                };
                                return updated;
                            });
                        } catch (err) {
                            console.error("Error parsing chunk data", err);
                        }
                    }
                }

                setMessages((prev) => {
                    if (prev.length > 6) {
                        prev.shift();
                        prev.shift();
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setInputDisabled(false);
            setTimeout(() => focusTargetRef.current?.focus(), 500);
        }
    }

    function handleKeyPress(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    }

    async function clearChat() {
        await fetch("http://localhost:3000/clear-history", {
            method: "POST",
        });
        setMessages([]);
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar
                clearChat={clearChat}
                models={models}
                selectedModel={selectedModel}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                setSelectedModel={setSelectedModel}
            />

            <Chat
                isDarkMode={isDarkMode}
                messages={messages}
                chatContainerRef={chatContainerRef}
            />

            <ChatInput
                setInput={setInput}
                input={input}
                inputDisabled={inputDisabled}
                focusTargetRef={focusTargetRef}
                handleKeyPress={handleKeyPress}
                handleSendMessage={handleSendMessage}
            />
        </div>
    );
}
