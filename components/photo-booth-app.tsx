"use client";

import { SessionProvider, useSession } from "@/hooks/use-session-store";
import { HomeScreen } from "@/components/screens/home-screen";
import { CameraScreen } from "@/components/screens/camera-screen";
import { ResultScreen } from "@/components/screens/result-screen";

function Router() {
  const { view } = useSession();
  return (
    <main className="app-shell">
      {view === "home" && <HomeScreen />}
      {view === "camera" && <CameraScreen />}
      {view === "result" && <ResultScreen />}
    </main>
  );
}

export function PhotoBoothApp() {
  return (
    <SessionProvider>
      <Router />
    </SessionProvider>
  );
}
