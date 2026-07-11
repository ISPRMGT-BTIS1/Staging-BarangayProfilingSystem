import React, { useState } from "react";
import {
  users as initialUsers,
  barangays,
  roles,
  generateId
} from "../mockData";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../utils/auditLogger";

export default function UsersView() {
  const { currentUser } = useAuth();
  const [usersList, setUsersList] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: 3, // Default: Staff
    barangayId: "",
    isActive: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.password || !formData.barangayId) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Check duplicate username
    if (usersList.some(u => u.username === formData.username)) {
      alert("Username already exists!");
      return;
    }

    const newUserId = generateId("USR");
    const newUser = {
      userId: newUserId,
      username: formData.username,
      passwordHash: formData.password, // Plain text matching mock implementation
      fullName: formData.fullName,
      roleId: parseInt(formData.roleId),
      barangayId: formData.barangayId,
      isActive: formData.isActive
    };

    initialUsers.push(newUser);
    setUsersList([...usersList, newUser]);

    // Log Audit
    logAudit(
      "users",
      newUserId,
      "CREATE",
      currentUser?.userId || "USR-1",
      `Created user: ${formData.username} (${formData.fullName})`
    );

    setShowAddModal(false);
    setFormData({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      roleId: 3,
      barangayId: "",
      isActive: true
    });
    alert(`Successfully registered user "${newUser.fullName}"!`);
  };

  const toggleUserActive = (userId, currentStatus, username) => {
    const newStatus = !currentStatus;
    const actionLabel = newStatus ? "activate" : "deactivate";
    
    if (confirm(`Are you sure you want to ${actionLabel} user "${username}"?`)) {
      const updated = usersList.map(u => {
        if (u.userId === userId) {
          return { ...u, isActive: newStatus };
        }
        return u;
      });

      // Update mock data array
      const found = initialUsers.find(u => u.userId === userId);
      if (found) found.isActive = newStatus;

      setUsersList(updated);

      // Log Audit
      logAudit(
        "users",
        userId,
        "UPDATE",
        currentUser?.userId || "USR-1",
        `${newStatus ? "ACTIVATED" : "DEACTIVATED"} user: ${username}`
      );
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.roleId === roleId);
    return role ? role.roleName : "Unknown";
  };

  const getBarangayName = (barangayId) => {
    const brgy = barangays.find(b => b.id === barangayId);
    return brgy ? brgy.name : "System-wide";
  };

  const inputClass = "border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-slate-500 mb-1";

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#16324A]">User Management</h1>
          <p className="text-sm text-slate-500 font-sans">Admin console for configuring personnel roles, access privileges, and credentials</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#16324A] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>+</span>
          <span>Add User</span>
        </button>
      </div>

      {/* Main Ledger Table */}
      <section className="ledger-container">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Barangay Scope</th>
              <th>Access Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user) => (
              <tr key={user.userId}>
                <td className="font-bold text-[#16324A] text-sm">
                  {user.fullName}
                </td>
                <td className="font-mono text-xs text-slate-500">
                  {user.username}
                </td>
                <td className="text-xs font-semibold text-slate-600">
                  {getRoleName(user.roleId)}
                </td>
                <td className="text-xs text-slate-500">
                  {getBarangayName(user.barangayId)}
                </td>
                <td>
                  <span className={user.isActive ? "seal-stamped-active" : "seal-stamped-inactive"}>
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="text-right">
                  {user.userId !== currentUser.userId ? (
                    <button
                      onClick={() => toggleUserActive(user.userId, user.isActive, user.username)}
                      className={`border text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer ${
                        user.isActive
                          ? "border-[#9B3D30] text-[#9B3D30] hover:bg-[#9B3D30] hover:text-white"
                          : "border-[#2E5A44] text-[#2E5A44] hover:bg-[#2E5A44] hover:text-white"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider italic">Current Session</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-md rounded-xs overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>👤</span>
                <span>Register New User Profile</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="p-6 space-y-4 font-sans">
              <div className="flex flex-col">
                <label className={labelClass}>Full Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Maria Clara"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>Username <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. maria.staff"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Password <span className="text-red-600">*</span></label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Confirm Password <span className="text-red-600">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>User Access Role</label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className={selectClass}
                  >
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Barangay Scope <span className="text-red-600">*</span></label>
                  <select
                    name="barangayId"
                    value={formData.barangayId}
                    onChange={handleInputChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Select Barangay Scope...</option>
                    {barangays.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="accent-[#2E5A44]"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-[#16324A] cursor-pointer">
                  Account is active on registration
                </label>
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
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
