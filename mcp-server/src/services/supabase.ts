export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  voiceCloneId: string | null;
  avatarId: string | null;
  onboardingCompleted: boolean;
  connectors: {
    calendar: boolean;
    github: boolean;
    slack: boolean;
  };
}

export interface AgentSession {
  id: string;
  userId: string;
  meetingId: string;
  meetingTitle: string;
  recallBotId: string;
  status: "pending" | "joining" | "active" | "completed" | "failed";
}

// Mock state — replace with real Supabase client
let mockUser: User | null = null;
let mockSessions: AgentSession[] = [];

export async function getUser(): Promise<User | null> {
  // TODO: Replace with Supabase query
  // const { data } = await supabase.from('users').select('*').single();
  return mockUser;
}

export async function getOnboardingStatus(): Promise<{
  completed: boolean;
  steps: Record<string, boolean>;
}> {
  if (!mockUser) {
    return {
      completed: false,
      steps: {
        signIn: false,
        profile: false,
        voiceClone: false,
        avatar: false,
        connectors: false,
        paraSetup: false,
      },
    };
  }

  return {
    completed: mockUser.onboardingCompleted,
    steps: {
      signIn: true,
      profile: !!mockUser.name,
      voiceClone: !!mockUser.voiceCloneId,
      avatar: !!mockUser.avatarId,
      connectors:
        mockUser.connectors.calendar ||
        mockUser.connectors.github ||
        mockUser.connectors.slack,
      paraSetup: true, // Check if PARA dirs have content
    },
  };
}

export async function createAgentSession(
  session: Omit<AgentSession, "id">
): Promise<AgentSession> {
  const newSession: AgentSession = {
    ...session,
    id: `session_${Date.now()}`,
  };
  mockSessions.push(newSession);
  return newSession;
}

export async function getAgentSessions(): Promise<AgentSession[]> {
  return mockSessions;
}
