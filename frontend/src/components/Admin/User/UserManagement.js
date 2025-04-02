import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";

// Import components
import AdminSidebar from "../adminSidebar";
import UserList from "./UserList";
import UserStats from "./UserStats";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, subscriptionFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First test if the API is reachable
      try {
        const testResponse = await api.get('/users/test');
        console.log("API Test Response:", testResponse.data);
      } catch (testErr) {
        console.error("API Test Error:", testErr);
      }
      
      // Now try to fetch users through the admin endpoint
      const response = await api.get('/admin/users');
      console.log("Users response:", response);
      setUsers(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError("Failed to load users");
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply subscription filter
    if (subscriptionFilter === "subscribed") {
      result = result.filter(user => user.subscribed);
    } else if (subscriptionFilter === "notSubscribed") {
      result = result.filter(user => !user.subscribed);
    }

    setFilteredUsers(result);
  };

  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleEditUser = (user) => {
    navigate(`/admin/users/edit/${user._id}`);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (userId, currentStatus) => {
    try {
      setLoading(true);
      await api.put(`/users/${userId}/subscription`, {
        subscribed: !currentStatus
      });
      toast.success(`User ${currentStatus ? 'unsubscribed' : 'subscribed'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error("Error updating subscription:", err);
      toast.error("Failed to update subscription status");
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await api.put(`/users/${userId}/role`, {
        role: newRole
      });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Failed to update user role");
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      setLoading(true);
      await api.post(`/users/${userId}/reset-password`);
      toast.success("Password reset email sent successfully");
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error("Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const response = await api.post('/users/login', {
        email: 'admin@zyrobyte.com',
        password: 'admin123'
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Logged in as admin');
        fetchUsers();
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Failed to login as admin");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">User Management</h1>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleAdminLogin}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md flex items-center hover:bg-yellow-700 w-full sm:w-auto justify-center sm:justify-start"
              >
                Login as Admin
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 w-full sm:w-auto justify-center sm:justify-start"
              >
                <FaPlus className="mr-2" />
                Create New User
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* User Stats */}
          <UserStats
            users={users}
            loading={statsLoading}
          />
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subscriptionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription
                </label>
                <select
                  id="subscriptionFilter"
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="notSubscribed">Not Subscribed</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* User List */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Users ({filteredUsers.length})</h2>
            <UserList 
              users={filteredUsers} 
              loading={loading}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleSubscription={handleToggleSubscription}
              onChangeRole={handleChangeRole}
              onResetPassword={handleResetPassword}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 