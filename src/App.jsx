import React, { useState } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ReportsView from "./components/ReportsView";
import ResidentsView from "./components/ResidentsView";
import HouseholdsView from "./components/HouseholdsView";
import { residents as initialResidents } from "./mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProfilingModal, setShowNewProfilingModal] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const [residentsList, setResidentsList] = useState(initialResidents);

  const handleNewProfiling = () => {
    setActiveTab("residents");
    setShowNewProfilingModal(true);
  };

  const handlePrintBirthdays = (celebrators) => {
    const listStr = celebrators.map(c => `- ${c.name} (${c.age} yrs, Resident ID: ${c.residentId})`).join("\n");
    alert(`-----------------------------------------\nOFFICIAL SNAPS: BIRTHDAY CELEBRATORS LIST\n-----------------------------------------\nDate: ${new Date().toLocaleDateString()}\n\n${listStr}\n\n-----------------------------------------\nSending list print job to spooler...`);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onPrintBirthdays={handlePrintBirthdays} />;
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
        return <ReportsView />;
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

              {/* Section 3: Registry Audits */}
              <div>
                <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-2">
                  System Audit Logs Settings
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#D1D7CE]/40">
                    <span className="text-slate-600">Auto-backup snapshot logs weekly</span>
                    <span className="font-mono font-bold text-[#2E5A44] bg-[#2E5A44]/10 border border-[#2E5A44]/20 px-2 rounded-xs">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#D1D7CE]/40">
                    <span className="text-slate-600">Require supervisor key for Deceased status flags</span>
                    <span className="font-mono font-bold text-[#2E5A44] bg-[#2E5A44]/10 border border-[#2E5A44]/20 px-2 rounded-xs">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView />;
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
