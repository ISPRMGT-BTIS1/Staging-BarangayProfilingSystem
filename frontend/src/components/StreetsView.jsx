import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { logAudit } from "../utils/auditLogger";
import { supabase } from "../utils/supabaseClient";
import { parseSafeInt } from "../utils/helpers";

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

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStreet, setEditStreet] = useState(null); // { streetId, streetName, barangayId }
  const [editStreetName, setEditStreetName] = useState("");
  const [editBarangayId, setEditBarangayId] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const handleAddStreet = async (e) => {
    e.preventDefault();
    // Auto-resolve to the single barangay in the system
    const resolvedBarangayId = barangays[0]?.id || 1;
    if (!newStreetName) {
      alert("Please enter a street name.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('streets')
        .insert([{
          barangay_id: resolvedBarangayId,
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
        `Created street: ${newStreetName} under Barangay ${resolvedBarangayId}`
      );

      setShowAddModal(false);
      setNewStreetName("");
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

  const openEditModal = (street) => {
    setEditStreet(street);
    setEditStreetName(street.streetName);
    setEditBarangayId(street.barangayId);
    setShowEditModal(true);
  };

  const handleEditStreet = async (e) => {
    e.preventDefault();
    if (!editStreetName) {
      alert("Please enter a street name.");
      return;
    }
    setEditSaving(true);
    try {
      const { error } = await supabase
        .from('streets')
        .update({
          street_name: editStreetName,
          barangay_id: editStreet.barangayId || barangays[0]?.id || 1
        })
        .eq('street_id', editStreet.streetId);

      if (error) throw error;

      await logAudit(
        "streets",
        editStreet.streetId,
        "UPDATE",
        currentUser?.userId || null,
        `Updated street: ${editStreet.streetName} → ${editStreetName}`
      );

      setShowEditModal(false);
      setEditStreet(null);
      if (refetch) refetch();

    } catch (err) {
      console.error("Error updating street:", err);
      alert("Failed to update street.");
    } finally {
      setEditSaving(false);
    }
  };

  // Filter computation
  const filteredStreets = streetsList.filter(street => {
    if (barangayFilter === "all") return true;
    return street.barangayId === barangayFilter;
  });

  const inputClass = "border border-[#F8BBD0] bg-[#FFF5F8] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#E8198A] focus:ring-1 focus:ring-[#E8198A] transition-all";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-[#E8198A] mb-1";

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#E8198A]">Streets Management</h1>
          <p className="text-sm text-slate-500 font-sans">Admin control console for managing barangay sector streets and routing rules</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#E8198A] hover:bg-[#c41273] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>+</span>
          <span>Add Street</span>
        </button>
      </div>

      {/* Filters Control Row */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
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
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => openEditModal(street)}
                        className="border border-[#E8198A] text-[#E8198A] hover:bg-[#E8198A] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer mr-1"
                      >
                        Edit
                      </button>
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
                <td colSpan="3" className="text-center py-8 text-slate-400 font-serif italic bg-white">
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
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-sm rounded-xs overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>🛣️</span>
                <span>Add New Street</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStreet} className="p-6 space-y-4 font-sans">
              <div className="flex flex-col">
                <label className={labelClass}>Street Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mabini St."
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Add Street
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Street Modal */}
      {showEditModal && editStreet && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-sm rounded-xs overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>✏️</span>
                <span>Edit Street</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditStreet} className="p-6 space-y-4 font-sans">
              <div className="flex flex-col">
                <label className={labelClass}>Street Name</label>
                <input
                  type="text"
                  required
                  value={editStreetName}
                  onChange={(e) => setEditStreetName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
