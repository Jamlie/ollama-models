export type Model = {
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

export type Message = {
    role: "user" | "assistant";
    content: string;
};
