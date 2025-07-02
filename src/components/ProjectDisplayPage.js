import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Eye, Calendar, Clock,
  Users, Building, User, X, ArrowUpDown,
  MapPin, Code, DollarSign, Target
} from 'lucide-react';
import axios from 'axios';

const ProjectDisplayPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('projectName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const baseURL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/projects`);
        setProjects(response.data.data);
        console.log("rrere",response)
        setError('');
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [baseURL]);

  const getProjectStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return 'Upcoming';
    if (today > end) return 'Completed';
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-emerald-700';
      case 'Completed': return 'text-blue-700';
      case 'Upcoming': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  };

  const departments = [...new Set(projects.map(p => p.department))].filter(Boolean);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedProjects = projects
    .filter(project => {
      const status = getProjectStatus(project.startDate, project.endDate);
      const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || project.department === filterDepartment;
      const matchesStatus = !filterStatus || status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortBy], bVal = b[sortBy];
      if (sortBy === 'startDate' || sortBy === 'endDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 py-10 px-4 sm:px-8 overflow-hidden">

      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          width="100%"
          height="100%"
          className="text-gray-300"
          preserveAspectRatio="xMidYMid slice"
        >
          <pattern
            id="circuit-pattern"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            <rect width="400" height="400" fill="none" />
            <path
              d="M0 100 L400 100 M0 200 L400 200 M0 300 L400 300 M100 0 L100 400 M200 0 L200 400 M300 0 L300 400"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>


      <div className="relative z-10 max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-500">Total Projects: {projects.length}</p>
        </div>


        <div className="mb-4 flex justify-end">
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="border rounded-md px-3 py-1.5 shadow-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-1.5 shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}


        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-left text-sm font-semibold text-white">
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('projectName')}>
                  Project Name <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('startDate')}>
                  Start Date <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('endDate')}>
                  End Date <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProjects.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-gray-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedProjects.map((project, idx) => {
                  const status = getProjectStatus(project.startDate, project.endDate);
                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3">{project.projectName}</td>
                      <td className="px-4 py-3">{project.companyName}</td>
                      <td className="px-4 py-3">{project.clientCode}</td>
                      <td className="px-4 py-3">{project.pvProjectManager}</td>
                      <td className="px-4 py-3">{project.department}</td>
                      <td className="px-4 py-3">{formatDate(project.startDate)}</td>
                      <td className="px-4 py-3">{formatDate(project.endDate)}</td>
                      <td className={`px-4 py-3 font-medium ${getStatusColor(status)}`}>{status}</td>
                      <td className="px-4 py-3">{project.teamMembers?.length || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelectedProject(project); setShowModal(true); }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {showModal && selectedProject && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 animate-in fade-in duration-300">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
              {selectedProject.companyLogo ? (
                <img 
                  src={selectedProject.companyLogo} 
                  alt={`${selectedProject.companyName} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
               
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
                style={{ display: selectedProject.companyLogo ? 'none' : 'flex' }}
              >
                <Building className="h-5 w-5 text-white" />
              </div>
            </div>
          
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedProject.projectName}</h2>
              <p className="text-sm text-gray-600 font-medium">{selectedProject.companyName}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(getProjectStatus(selectedProject.startDate, selectedProject.endDate))}`}>
                {getProjectStatus(selectedProject.startDate, selectedProject.endDate)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>


      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div className="grid md:grid-cols-2 gap-4">

          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-blue-600" />
                Project Info
              </h3>
              <div className="space-y-2">
                {[{
                  label: 'Client Code', icon: <Code className="h-3 w-3 text-gray-500" />, value: selectedProject.clientCode
                }, {
                  label: 'Project Manager', icon: <User className="h-3 w-3 text-gray-500" />, value: selectedProject.pvProjectManager
                }, {
                  label: 'Department', icon: <MapPin className="h-3 w-3 text-gray-500" />, value: selectedProject.department
                }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    {item.icon}
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-green-600" />
                Timeline & Billing
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-100">
                  <Calendar className="h-3 w-3 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">Duration</p>
                    <p className="text-sm font-medium text-green-900">{calculateDuration(selectedProject.startDate, selectedProject.endDate)}</p>
                          </div>
                          
                </div>
               
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Start</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedProject.startDate)}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">End</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedProject.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-600" />
              Team Members
              <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-medium">
                {selectedProject.teamMembers?.length || 0}
              </span>
            </h3>
            {selectedProject.teamMembers?.length ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedProject.teamMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                      <p className="text-xs text-gray-600">Team Member #{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No team members assigned</p>
                <p className="text-xs text-gray-400">They will appear once added</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default ProjectDisplayPage;