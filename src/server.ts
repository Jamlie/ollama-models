// src/server.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Ollama } from "ollama";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(cors());

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
        const { model, messages } = req.body;

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Transfer-Encoding", "chunked");

        const response = await ollama.chat({
            model: model,
            messages: messages,
            stream: true,
        });

        for await (const msg of response) {
            res.write(msg.message.content);
        }

        res.end();
    } catch (error) {
        console.error("Error sending message to Ollama:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
