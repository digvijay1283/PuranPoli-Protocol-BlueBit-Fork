import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Disruptions from "./pages/Disruptions";
import LiveIntelFeed from "./pages/LiveIntelFeed";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/disruptions" element={<Disruptions />} />
          <Route path="/live-feed" element={<LiveIntelFeed />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
