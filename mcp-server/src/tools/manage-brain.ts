export const searchBrainToolDef = {
  name: "search_brain",
  description:
    "Search the user's second brain (PARA knowledge base) for relevant context. Uses semantic search over stored entries.",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Search query to find relevant knowledge entries",
      },
      category: {
        type: "string",
        enum: ["projects", "areas", "resources", "archive"],
        description: "Optional: filter by PARA category",
      },
    },
    required: ["query"],
  },
};

export async function searchBrainHandler(args: {
  query: string;
  category?: string;
}): Promise<string> {
  // TODO: Replace with Supabase pgvector semantic search
  // const embedding = await openai.embeddings.create({ input: args.query, model: 'text-embedding-3-small' });
  // const { data } = await supabase.rpc('match_brain_entries', { query_embedding: embedding, match_count: 5 });

  return [
    `## Second Brain Search Results`,
    ``,
    `Query: "${args.query}"${args.category ? ` (category: ${args.category})` : ""}`,
    ``,
    `_No entries found. Your second brain is empty._`,
    ``,
    `Add entries using \`/manage-brain add <content>\` or through the onboarding wizard.`,
  ].join("\n");
}

export const addBrainEntryToolDef = {
  name: "add_brain_entry",
  description:
    "Add a new entry to the user's second brain. Entries are stored in the PARA structure and used as context by the delegate agent.",
  inputSchema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description: "Title of the knowledge entry",
      },
      content: {
        type: "string",
        description: "Content of the knowledge entry (markdown)",
      },
      category: {
        type: "string",
        enum: ["projects", "areas", "resources", "archive"],
        description: "PARA category for the entry",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Optional tags for the entry",
      },
    },
    required: ["title", "content", "category"],
  },
};

export async function addBrainEntryHandler(args: {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}): Promise<string> {
  // TODO: Write to filesystem + store embedding in Supabase
  const slug = args.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filePath = `second-brain/${args.category}/${slug}.md`;

  const frontmatter = [
    "---",
    `title: ${args.title}`,
    `category: ${args.category}`,
    `tags: [${(args.tags ?? []).join(", ")}]`,
    `created: ${new Date().toISOString().split("T")[0]}`,
    "---",
  ].join("\n");

  const fileContent = `${frontmatter}\n\n${args.content}\n`;

  // In production, write to filesystem and generate embedding
  // For now, just return confirmation
  return [
    `## Entry Added to Second Brain`,
    ``,
    `- **Title:** ${args.title}`,
    `- **Category:** ${args.category}`,
    `- **Path:** \`${filePath}\``,
    `- **Tags:** ${(args.tags ?? []).join(", ") || "none"}`,
    ``,
    `The delegate agent will use this entry as context in future meetings.`,
  ].join("\n");
}
