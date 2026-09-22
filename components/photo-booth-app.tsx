"use client";

import { SessionProvider, useSession } from "@/hooks/use-session-store";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { HomeScreen } from "@/components/screens/home-screen";
import { CameraScreen } from "@/components/screens/camera-screen";
import { ResultScreen } from "@/components/screens/result-screen";
import { CreditTag } from "@/components/credit-tag";

function Router() {
  const { view } = useSession();
  return (
    <main className="app-shell">
      {view === "home" && <HomeScreen />}
      {view === "camera" && <CameraScreen />}
      {view === "result" && <ResultScreen />}
      <CreditTag />
    </main>
  );
}

export function PhotoBoothApp() {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
