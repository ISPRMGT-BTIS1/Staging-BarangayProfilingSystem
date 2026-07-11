import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ReportsView from "./components/ReportsView";
import ResidentsView from "./components/ResidentsView";
import ResidentDetailView from "./components/ResidentDetailView";
import HouseholdsView from "./components/HouseholdsView";
import StreetsView from "./components/StreetsView";
import UsersView from "./components/UsersView";
import { residents as initialResidents, auditLog, getResidentDisplayName } from "./mockData";

export default function App() {
  const { currentUser } = useAuth();

  // If not logged in, show login page
  if (!currentUser) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProfilingModal, setShowNewProfilingModal] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const [residentsList, setResidentsList] = useState(initialResidents);
  const [selectedResidentId, setSelectedResidentId] = useState(null);

  const handleNewProfiling = () => {
    setActiveTab("residents");
    setShowNewProfilingModal(true);
  };

  const handlePrintBirthdays = (celebrators) => {
    const listStr = celebrators.map(c => `- ${getResidentDisplayName(c)} (Resident ID: ${c.residentId})`).join("\n");
    alert(`-----------------------------------------\nOFFICIAL SNAPS: BIRTHDAY CELEBRATORS LIST\n-----------------------------------------\nDate: ${new Date().toLocaleDateString()}\n\n${listStr}\n\n-----------------------------------------\nSending list print job to spooler...`);
  };

  const handleViewResident = (residentId) => {
    setSelectedResidentId(residentId);
    setActiveTab("residentDetail");
  };

  const handleBackToResidents = () => {
    setSelectedResidentId(null);
    setActiveTab("residents");
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onPrintBirthdays={handlePrintBirthdays} residentsList={residentsList} />;
      case "residents":
        return (
          <ResidentsView
            searchQuery={searchQuery}
            showNewProfilingModal={showNewProfilingModal}
            setShowNewProfilingModal={setShowNewProfilingModal}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setSelectedHouseholdId={setSelectedHouseholdId}
            residentsList={residentsList}
            setResidentsList={setResidentsList}
            onViewResident={handleViewResident}
          />
        );
      case "residentDetail":
        return (
          <ResidentDetailView
            residentId={selectedResidentId}
            residentsList={residentsList}
            onBack={handleBackToResidents}
          />
        );
      case "households":
        return (
          <HouseholdsView
            searchQuery={searchQuery}
            selectedHouseholdId={selectedHouseholdId}
            setSelectedHouseholdId={setSelectedHouseholdId}
            residentsList={residentsList}
          />
        );
      case "reports":
        return <ReportsView residentsList={residentsList} />;
      case "streets":
        return isAdmin ? <StreetsView /> : <DashboardView onPrintBirthdays={handlePrintBirthdays} residentsList={residentsList} />;
      case "users":
        return isAdmin ? <UsersView /> : <DashboardView onPrintBirthdays={handlePrintBirthdays} residentsList={residentsList} />;
      case "settings":
        return (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-serif text-[#16324A]">Settings & Administration</h1>
              <p className="text-sm text-slate-500 font-sans">Configure local parameters, staff permissions, and registry stamp templates</p>
            </div>

            <div className="ledger-container p-5 space-y-6">
              {/* Section 1: Barangay Details */}
              <div>
                <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-3">
                  Barangay Profiles Config
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F9FAF8] border border-[#D1D7CE] p-3 rounded-xs">
                    <p className="font-bold text-[#16324A]">Barangay 1 Profile</p>
                    <p className="text-slate-500 mt-1">Official Name: Barangay San Jose</p>
                    <p className="text-slate-500">Sector Code: BRGY-1</p>
                    <p className="text-slate-500">Official Seal Symbol: 🏛️ Seal Stamped A</p>
                  </div>
                  <div className="bg-[#F9FAF8] border border-[#D1D7CE] p-3 rounded-xs">
                    <p className="font-bold text-[#16324A]">Barangay 2 Profile</p>
                    <p className="text-slate-500 mt-1">Official Name: Barangay Santa Isabel</p>
                    <p className="text-slate-500">Sector Code: BRGY-2</p>
                    <p className="text-slate-500">Official Seal Symbol: 🏛️ Seal Stamped B</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Stamped Seals Styling Template */}
              <div>
                <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-3">
                  Registry Stamp Seals Preview
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center p-3 border border-[#D1D7CE] rounded bg-white">
                    <span className="seal-stamped-active mb-2">ACTIVE</span>
                    <span className="text-[10px] text-slate-400 font-mono">seal-stamped-active</span>
                  </div>
                  <div className="flex flex-col items-center p-3 border border-[#D1D7CE] rounded bg-white">
                    <span className="seal-stamped-inactive mb-2">INACTIVE</span>
                    <span className="text-[10px] text-slate-400 font-mono">seal-stamped-inactive</span>
                  </div>
                  <div className="flex flex-col items-center p-3 border border-[#D1D7CE] rounded bg-white">
                    <span className="seal-stamped-gold mb-2">MOVED</span>
                    <span className="text-[10px] text-slate-400 font-mono">seal-stamped-gold</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Audit Log */}
              <div>
                <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-2">
                  System Audit Log
                </h3>
                {auditLog.length > 0 ? (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {[...auditLog].reverse().slice(0, 20).map((entry) => (
                      <div key={entry.auditId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#D1D7CE]/40">
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(entry.performedAt).toLocaleString()}
                          </span>
                          <span className="text-slate-600">
                            <strong className="text-[#16324A]">{entry.actionType}</strong> on <span className="font-mono">{entry.tableName}</span>
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{entry.recordId}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No audit log entries yet. Actions will be logged as you use the system.</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView onPrintBirthdays={handlePrintBirthdays} residentsList={residentsList} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F1] flex flex-col font-sans text-[#16324A]">
      {/* Top Bar matching wireframe */}
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewProfiling={handleNewProfiling}
      />

      {/* Main Shell (Sidebar + Content View) */}
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F2F4F1]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
