import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { logAudit } from "../utils/auditLogger";
import { supabase } from "../utils/supabaseClient";

export default function StreetsView() {
  const { currentUser } = useAuth();
  const { streets, barangays, helpers: { generateId }, refetch } = useData();
  const [streetsList, setStreetsList] = useState([]);

  React.useEffect(() => {
    setStreetsList(streets);
  }, [streets]);
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStreetName, setNewStreetName] = useState("");
  const [newBarangayId, setNewBarangayId] = useState("");

  const handleAddStreet = async (e) => {
    e.preventDefault();
    if (!newStreetName || !newBarangayId) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('streets')
        .insert([{
          barangay_id: parseInt(String(newBarangayId).replace(/\D/g, ''), 10),
          street_name: newStreetName
        }])
        .select('street_id')
        .single();
        
      if (error) throw error;
      
      const newStreetId = data.street_id;

      // Log Audit
      await logAudit(
        "streets",
        newStreetId,
        "CREATE",
        currentUser?.userId || null,
        `Created street: ${newStreetName} under Barangay ${newBarangayId}`
      );

      setShowAddModal(false);
      setNewStreetName("");
      setNewBarangayId("");
      alert(`Successfully added street "${newStreetName}"!`);
      
      if (refetch) refetch();
      
    } catch (err) {
      console.error("Error creating street:", err);
      alert("Failed to add street to database.");
    }
  };

  const handleDeleteStreet = async (streetId, name) => {
    if (confirm(`Are you sure you want to delete street "${name}"?`)) {
      try {
        const { error } = await supabase
          .from('streets')
          .delete()
          .eq('street_id', streetId);
          
        if (error) throw error;

        await logAudit(
          "streets",
          streetId,
          "DELETE",
          currentUser?.userId || null,
          `Deleted street: ${name}`
        );
        
        if (refetch) refetch();
        
      } catch (err) {
        console.error("Error deleting street:", err);
        alert("Failed to delete street from database. It might be in use.");
      }
    }
  };

  // Filter computation
  const filteredStreets = streetsList.filter(street => {
    if (barangayFilter === "all") return true;
    return street.barangayId === barangayFilter;
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#16324A]">Streets Management</h1>
          <p className="text-sm text-slate-500 font-sans">Admin control console for managing barangay sector streets and routing rules</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#16324A] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>+</span>
          <span>Add Street</span>
        </button>
      </div>

      {/* Filters Control Row */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Filter by Barangay</label>
          <select
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
          >
            <option value="all">ALL BARANGAYS</option>
            {barangays.map(b => (
              <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono font-semibold text-slate-500">
          Showing <span className="text-[#16324A] font-bold">{filteredStreets.length}</span> of {streetsList.length} total streets
        </div>
      </section>

      {/* Main Ledger Table */}
      <section className="ledger-container">
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="w-24">Street ID</th>
              <th>Street Name</th>
              <th>Barangay Jurisdiction</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStreets.length > 0 ? (
              filteredStreets.map((street) => {
                const brgy = barangays.find(b => b.id === street.barangayId);
                return (
                  <tr key={street.streetId}>
                    <td className="font-mono text-xs font-semibold tabular-numbers text-slate-500">
                      {street.streetId}
                    </td>
                    <td className="font-bold text-[#16324A] text-sm">
                      {street.streetName}
                    </td>
                    <td className="text-xs font-semibold text-slate-600">
                      {brgy ? brgy.name : "Unknown"}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleDeleteStreet(street.streetId, street.streetName)}
                        className="border border-[#9B3D30] text-[#9B3D30] hover:bg-[#9B3D30] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 font-serif italic bg-white">
                  No streets registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Add Street Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-sm rounded-xs overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>🛣️</span>
                <span>Add New Street</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStreet} className="p-6 space-y-4 font-sans">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Street Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mabini St."
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Barangay Jurisdiction</label>
                <select
                  value={newBarangayId}
                  onChange={(e) => setNewBarangayId(e.target.value)}
                  required
                  className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                >
                  <option value="">Select Barangay...</option>
                  {barangays.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Add Street
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
