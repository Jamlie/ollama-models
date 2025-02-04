import express from "express";
import cors from "cors";
import { Message } from "./src/types/types";
import { Ollama } from "ollama";

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

const history: Message[] = [];
// const MAX_HISTORY_SIZE = 5;

const ollama = new Ollama({
    host: "http://localhost:11434",
});

app.get("/models", async (_req, res) => {
    try {
        const ls = await ollama.list();
        res.json({ models: ls });
    } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).json({ error: "Failed to fetch models" });
    }
});

app.post("/ollama", async (req, res) => {
    try {
        const { model, message } = req.body;

        const newUserMessage: Message = { role: "user", content: message };
        history.push(newUserMessage);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.write(": stream started\n\n");

        const response = await ollama.chat({
            model: model,
            messages: history,
            stream: true,
        });

        let assistantResponse = "";

        for await (const msg of response) {
            const chunk = msg.message.content;
            assistantResponse += chunk;
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }

        const newAssistantMessage: Message = {
            role: "assistant",
            content: assistantResponse,
        };

        history.push(newAssistantMessage);

        res.write(`data: [DONE]\n\n`);
        res.end();
    } catch (error) {
        console.error("Error sending message to Ollama:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.post("/clear-history", (_req, res) => {
    history.length = 0;
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
