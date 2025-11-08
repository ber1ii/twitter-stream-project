import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Feed from "./pages/Feed";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const appWrapper =
  "min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={appWrapper}>
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
            <Feed />
          </ErrorBoundary>
        </main>
      </div>
    </QueryClientProvider>
  );
}