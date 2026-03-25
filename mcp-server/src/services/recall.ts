export interface RecallBot {
  id: string;
  meetingUrl: string;
  botName: string;
  status: "joining" | "in_waiting_room" | "active" | "completed" | "failed";
}

// Mock Recall.ai service — replace with real API calls
let mockBots: RecallBot[] = [];

export async function createBot(
  meetingUrl: string,
  botName: string
): Promise<RecallBot> {
  // TODO: Replace with real Recall.ai API call
  // const response = await fetch('https://api.recall.ai/api/v1/bot/', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Token ${process.env.RECALL_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     meeting_url: meetingUrl,
  //     bot_name: botName,
  //     real_time_transcription: {
  //       destination_url: `wss://${process.env.AGENT_WS_HOST}/ws`,
  //     },
  //   }),
  // });

  const bot: RecallBot = {
    id: `bot_${Date.now()}`,
    meetingUrl,
    botName,
    status: "joining",
  };

  mockBots.push(bot);

  // Simulate bot joining after a delay
  setTimeout(() => {
    bot.status = "active";
  }, 3000);

  return bot;
}

export async function getBotStatus(botId: string): Promise<RecallBot | null> {
  return mockBots.find((b) => b.id === botId) ?? null;
}
