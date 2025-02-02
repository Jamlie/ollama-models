import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";

type Model = {
    details: {
        families: string[];
        family: string;
        format: string;
        parameter_size: string;
        parent_model: string;
        quantization_level: string;
    };
    digest: string;
    model: string;
    modified_at: Date;
    name: string;
    size: number;
};

type Message = {
    role: "user" | "assistant";
    content: string;
};

const App: React.FC = () => {
    const [input, setInput] = useState("");
    const [responses] = useState<string[]>([]);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const focusTargetRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/models",
                );
                const models: Model[] = response.data.models.models;
                setModels(models.map((model) => model.name));
                if (models.length > 0) {
                    setSelectedModel(models[0].name);
                }
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [responses]);

    const handleSendMessage = async () => {
        try {
            if (!selectedModel) {
                alert("Please select a model first!");
                return;
            }

            setInputDisabled(true);

            const newMessages: Message[] = [
                ...messages,
                { role: "user", content: input },
            ];
            setMessages(newMessages);

            const response = await fetch("http://localhost:3000/ollama", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: newMessages,
                }),
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Failed to read stream");

            let assistantResponse = "";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "" },
            ]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                assistantResponse += chunk;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content =
                        assistantResponse;
                    return newMessages;
                });
            }

            setInput("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setInputDisabled(false);
            setTimeout(() => focusTargetRef.current?.focus(), 500);
        }
    };

    const handleKeyPress = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    };

    function clearChat() {
        setMessages((_prev) => []);
    }

    return (
        <div className="bg-gray-900 w-screen h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 bg-gray-700 shadow-lg z-50">
                <div className="max-w-screen-lg mx-auto flex justify-between items-center p-4">
                    <h1 className="text-white text-lg font-semibold">
                        Ollama Chat
                    </h1>
                    <button
                        onClick={clearChat}
                        className="ml-2 bg-red-500 text-white py-2 px-4 rounded-lg"
                    >
                        Clear Chat
                    </button>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded-lg"
                    >
                        {models.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-full max-w-screen-lg flex-1 mx-auto p-8 pb-32 mt-16 mb-24">
                <div className="flex flex-col">
                    {messages.map((message, index) => (
                        <div className="mb-4" key={index}>
                            <div className="flex items-start">
                                <div className="ml-3 mb-3">
                                    <div
                                        className="bg-gray-700 text-white rounded-lg p-2 break-words"
                                        style={{
                                            backgroundColor:
                                                message.role === "user"
                                                    ? "black"
                                                    : "",
                                        }}
                                    >
                                        <ReactMarkdown>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 bg-gray-700 shadow-lg">
                <div className="max-w-screen-lg mx-auto w-full p-4 flex space-x-4 justify-center items-center">
                    <textarea
                        ref={focusTargetRef}
                        rows={2}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 py-2 px-3 rounded-lg border-none focus:outline-none focus:ring focus:border-blue-300 bg-gray-800 text-white resize-none"
                        disabled={inputDisabled}
                        style={{
                            opacity: inputDisabled ? 0.5 : 1,
                            cursor: inputDisabled ? "not-allowed" : "auto",
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-full"
                        disabled={inputDisabled}
                        style={{
                            opacity: inputDisabled ? 0.5 : 1,
                            cursor: inputDisabled ? "not-allowed" : "auto",
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
