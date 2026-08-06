import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function IncidentsPage() {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [residentsList, setResidentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    resident_id: '',
    incident_type: 'Blotter',
    complainant_name: '',
    complainant_contact: '',
    description: '',
    status: 'Active',
  });

  const fetchIncidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        residents:resident_id (first_name, last_name, middle_name)
      `)
      .order('incident_date', { ascending: false });
    
    if (data) setIncidents(data);
    
    // Also fetch residents for dropdown
    const { data: resData } = await supabase
      .from('residents')
      .select('resident_id, first_name, last_name')
      .eq('residency_status', 'Active')
      .order('last_name');
    if (resData) setResidentsList(resData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resident_id || !formData.description) {
      alert("Please select a resident and enter a description.");
      return;
    }

    const { data, error } = await supabase.from('incidents').insert([{
      resident_id: formData.resident_id,
      incident_type: formData.incident_type,
      complainant_name: formData.complainant_name || null,
      complainant_contact: formData.complainant_contact || null,
      description: formData.description,
      status: formData.status,
      recorded_by: currentUser?.userId || null,
      incident_date: new Date().toISOString()
    }]);

    if (error) {
      alert("Error saving incident: " + error.message);
    } else {
      setShowModal(false);
      setFormData({
        resident_id: '',
        incident_type: 'Blotter',
        complainant_name: '',
        complainant_contact: '',
        description: '',
        status: 'Active',
      });
      fetchIncidents();
    }
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('incident_id', id);
    if (!error) fetchIncidents();
  };

  const filteredIncidents = incidents.filter(i => {
    const matchType = filterType === 'ALL' || i.incident_type === filterType;
    const q = search.toLowerCase();
    const resName = i.residents ? `${i.residents.first_name} ${i.residents.last_name}`.toLowerCase() : '';
    const compName = (i.complainant_name || '').toLowerCase();
    const matchSearch = !q || resName.includes(q) || compName.includes(q) || (i.description || '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#322A2C]">Incident Reports & Blotters</h1>
          <p className="text-sm text-slate-500 font-sans mt-1">Record and manage resident complaints and blotters</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#E8198A] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-[#C4157A] transition-colors"
        >
          + New Record
        </button>
      </div>

      <div className="ledger-container p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <label className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#FFF8F8] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#322A2C] text-[#322A2C] font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="Blotter">Blotter</option>
              <option value="Incident Report">Incident Report</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resident, complainant, or details..."
              className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-1.5 focus:outline-none focus:border-[#322A2C] w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-serif italic text-sm">Loading records…</div>
          ) : (
            <table className="ledger-table w-full">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Resident Involved</th>
                  <th>Complainant</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 font-serif italic bg-white">
                      No incident records found.
                    </td>
                  </tr>
                ) : filteredIncidents.map((inc, i) => (
                  <tr key={inc.incident_id}>
                    <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                    <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(inc.incident_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`inline-block text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm border ${inc.incident_type === 'Blotter' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {inc.incident_type}
                      </span>
                    </td>
                    <td className="font-semibold text-xs text-[#322A2C]">
                      {inc.residents ? `${inc.residents.first_name} ${inc.residents.last_name}` : 'Unknown'}
                    </td>
                    <td className="text-xs text-slate-600">
                      {inc.complainant_name ? (
                        <>
                          <div className="font-semibold">{inc.complainant_name}</div>
                          {inc.complainant_contact && <div className="text-[9px] font-mono text-slate-400">{inc.complainant_contact}</div>}
                        </>
                      ) : <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="text-xs text-slate-500 max-w-[200px] truncate" title={inc.description}>
                      {inc.description}
                    </td>
                    <td>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        inc.status === 'Active' ? 'bg-amber-100 text-amber-800' :
                        inc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      {(inc.status === 'Active' || inc.status === 'Ongoing') && (
                        <button 
                          onClick={() => updateStatus(inc.incident_id, 'Resolved')}
                          className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-800 underline mr-2"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#322A2C8c] backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-[600px] max-w-[90vw]">
            <h2 className="text-xl font-serif font-bold text-[#322A2C] mb-4">Record New Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Type *</label>
                  <select 
                    value={formData.incident_type}
                    onChange={e => setFormData({...formData, incident_type: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  >
                    <option value="Blotter">Blotter</option>
                    <option value="Incident Report">Incident Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Resident Involved *</label>
                <select 
                  required
                  value={formData.resident_id}
                  onChange={e => setFormData({...formData, resident_id: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                >
                  <option value="">-- Select Resident --</option>
                  {residentsList.map(r => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name} (ID: {r.resident_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Complainant Name</label>
                  <input 
                    type="text"
                    value={formData.complainant_name}
                    onChange={e => setFormData({...formData, complainant_name: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                    placeholder="If applicable"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Complainant Contact</label>
                  <input 
                    type="text"
                    value={formData.complainant_contact}
                    onChange={e => setFormData({...formData, complainant_contact: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Description / Details *</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                  placeholder="Detailed narrative of the incident..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#E8198A] text-white rounded text-sm font-semibold hover:bg-[#C4157A]">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
