import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasswordGate from "./components/PasswordGate";

import Home from "./pages/Home";
import MatchSetup from "./pages/MatchSetup";
import DataInput from "./pages/DataInput";
import CoachView from "./pages/CoachView";
import Players from "./pages/Players";
import Heatmaps from "./pages/Heatmaps";
import MatchComparison from "./pages/MatchComparison";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import StartingLineup from "./pages/StartingLineup";
import PlayerStats from "./pages/PlayerStats";
import Settings from "./pages/Settings";
import VoiceInput from "./pages/VoiceInput";
import AIAdvice from "./pages/AIAdvice";
import Guide from "./pages/Guide";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/setup"} component={MatchSetup} />
      <Route path={"/input/:matchId"} component={DataInput} />
      <Route path={"/voice/:matchId"} component={VoiceInput} />
      <Route path={"/coach/:matchId"} component={CoachView} />
      <Route path={"/ai-advice/:matchId"} component={AIAdvice} />
      <Route path={"/players"} component={Players} />
      <Route path={"/heatmap/:matchId"} component={Heatmaps} />
      <Route path={"/comparison"} component={MatchComparison} />
      <Route path={"/teams"} component={Teams} />
      <Route path={"/teams/:teamId"} component={TeamDetail} />
      <Route path={"/lineup/:matchId"} component={StartingLineup} />
      <Route path={"/player/:playerId"} component={PlayerStats} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/guide"} component={Guide} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <PasswordGate>
            <Router />
          </PasswordGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
