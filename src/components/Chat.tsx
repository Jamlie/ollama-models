import ReactMarkdown, { Components } from "react-markdown";
import { Message } from "../types/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneDark,
    oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
    chatContainerRef: React.RefObject<HTMLDivElement>;
    messages: Message[];
    isDarkMode: boolean;
};

function renderOptionsProducer(isDarkMode: boolean): Components {
    return {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };
}

export function Chat({ chatContainerRef, messages, isDarkMode }: Props) {
    return (
        <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex ${
                        message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                    }`}
                >
                    <div
                        className={`max-w-2xl px-4 py-2 rounded-lg ${
                            message.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        } whitespace-pre-wrap transition-colors duration-200`}
                    >
                        <ReactMarkdown
                            components={renderOptionsProducer(isDarkMode)}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
        </div>
    );
}
