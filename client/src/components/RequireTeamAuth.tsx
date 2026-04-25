import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useTeamAuth } from "@/contexts/TeamAuthContext";

interface RequireTeamAuthProps {
  children: ReactNode;
}

export default function RequireTeamAuth({ children }: RequireTeamAuthProps) {
  const { team, isLoading } = useTeamAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !team) {
      setLocation("/login");
    }
  }, [team, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return <>{children}</>;
}
