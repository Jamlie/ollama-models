import { MessageCircle, Moon, Sun, Trash2 } from "lucide-react";

type Props = {
    selectedModel: string;
    models: string[];
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setSelectedModel: (model: string) => void;
    clearChat: () => Promise<void>;
};

export function Navbar({
    selectedModel,
    models,
    isDarkMode,
    toggleDarkMode,
    setSelectedModel,
    clearChat,
}: Props) {
    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <MessageCircle className="h-8 w-8 text-blue-500" />
                        <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                            AI Chat
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="block w-48 px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                        >
                            {models.map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>
                        <button
                            onClick={clearChat}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
