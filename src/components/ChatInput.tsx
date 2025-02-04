import { Send } from "lucide-react";

type Props = {
    focusTargetRef: React.RefObject<HTMLTextAreaElement>;
    input: string;
    setInput: (input: string) => void;
    handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    inputDisabled: boolean;
    handleSendMessage: () => Promise<void>;
};

export function ChatInput({
    focusTargetRef,
    input,
    setInput,
    handleKeyPress,
    inputDisabled,
    handleSendMessage,
}: Props) {
    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-colors duration-200">
            <div className="max-w-4xl mx-auto flex items-center space-x-4">
                <textarea
                    ref={focusTargetRef}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message... ✨"
                    aria-label="Chat message input"
                    className={`flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/60 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none transition-all duration-200 px-4 py-3 placeholder-gray-600 ${inputDisabled
                            ? "bg-gray-50 dark:bg-gray-600 cursor-not-allowed"
                            : ""
                        }`}
                    style={{
                        minHeight: "3rem",
                        maxHeight: "15rem",
                        marginBottom: "2px",
                    }}
                    disabled={inputDisabled}
                    rows={1}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={inputDisabled || !input.trim()}
                    className="inline-flex items-center px-4 py-3 mb-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
