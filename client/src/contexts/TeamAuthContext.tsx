import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface Team {
  id: number;
  name: string;
  username: string;
}

interface TeamAuthContextType {
  team: Team | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  teamName: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (teamName: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const TeamAuthContext = createContext<TeamAuthContextType | undefined>(undefined);

const STORAGE_KEY = "victor_team_session";

export function TeamAuthProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = trpc.teamAuth.login.useMutation();
  const registerMutation = trpc.teamAuth.register.useMutation();
  const logoutMutation = trpc.teamAuth.logout.useMutation();

  // Load team from localStorage on mount
  useEffect(() => {
    const storedTeam = localStorage.getItem(STORAGE_KEY);
    if (storedTeam) {
      try {
        const teamData = JSON.parse(storedTeam);
        setTeam(teamData);
      } catch (error) {
        console.error("Failed to parse stored team data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await loginMutation.mutateAsync({ username, password });
    if (result.success && result.team) {
      setTeam(result.team);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.team));
    }
  };

  const register = async (teamName: string, username: string, password: string) => {
    const result = await registerMutation.mutateAsync({ teamName, username, password });
    if (result.success && result.team) {
      setTeam(result.team);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.team));
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    setTeam(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
  };

  return (
    <TeamAuthContext.Provider value={{ 
      team, 
      isLoading, 
      isAuthenticated: team !== null,
      teamName: team?.name || null,
      login, 
      register, 
      logout 
    }}>
      {children}
    </TeamAuthContext.Provider>
  );
}

export function useTeamAuth() {
  const context = useContext(TeamAuthContext);
  if (context === undefined) {
    throw new Error("useTeamAuth must be used within a TeamAuthProvider");
  }
  return context;
}
