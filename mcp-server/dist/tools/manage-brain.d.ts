export declare const searchBrainToolDef: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export declare function searchBrainHandler(args: {
    query: string;
    category?: string;
}): Promise<string>;
export declare const addBrainEntryToolDef: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            title: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                enum: string[];
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
};
export declare function addBrainEntryHandler(args: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
}): Promise<string>;
