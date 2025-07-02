import React, { useState, useEffect } from 'react';
import { Plus, X, Save, RotateCcw, XCircle, CheckCircle, AlertCircle, Loader ,Trash , Image} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

const ProjectInformationForm = () => {
  const [formData, setFormData] = useState({
    clientCode: '',
    companyLogo: null,
    companyName: '',
    projectName: '',
    typeOfProject: 'Based on client',
    pvProjectManager: 'Prajwal Salunkhe',
    startDate: '',
    endDate: '',
    allottedBillingHours: '',
    department: '',
    teamMembers: [],
    addTeamMembers: 'No'
  });

  const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api';

  const [teamMembersDB, setTeamMembersDB] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState('');

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: ''});
  const [newMembers, setNewMembers] = useState([{ firstName: '', lastName: '' }]);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
    const [showTeamMembersDropdown, setShowTeamMembersDropdown] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
const [logoPreview, setLogoPreview] = useState('');
  const fetchTeamMembers = async () => {
    setLoadingTeamMembers(true);
    setTeamMembersError('');
    try {
      const response = await axios.get(`${baseURL}/team-members`);
      console.log("resss",response)
      if (response.data.success) {
        setTeamMembersDB(response.data.data);
      } else {
        setTeamMembersError('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);



  const projectTypeOptions = [
    'Based on client',
    'Internal project',
    'Research & Development',
    'Maintenance'
  ];

  const projectManagerOptions = [
    'Prajwal Salunkhe',
    'Sachin T',
    'Rahul P S',
    'Tushar R'
  ];

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'IT', label: 'IT' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' }
  ];

  const addTeamMembersOptions = ['No', 'Yes'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientCode?.trim()) newErrors.clientCode = 'Client Code is required';
    if (!formData.companyName?.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.projectName?.trim()) newErrors.projectName = 'Project Name is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.endDate) newErrors.endDate = 'End Date is required';
    if (!formData.allottedBillingHours?.trim()) newErrors.allottedBillingHours = 'Allotted Billing Hours is required';
    else if (isNaN(formData.allottedBillingHours) || parseFloat(formData.allottedBillingHours) <= 0) {
      newErrors.allottedBillingHours = 'Please enter a valid number greater than 0';
    }
    if (!formData.department?.trim()) newErrors.department = 'Department is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End Date must be after Start Date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTeamMemberToggle = (memberId) => {
    const currentMembers = formData.teamMembers;
    const isSelected = currentMembers.includes(memberId);
    
    if (isSelected) {
      handleInputChange('teamMembers', currentMembers.filter(id => id !== memberId));
    } else {
      handleInputChange('teamMembers', [...currentMembers, memberId]);
    }
  };

  const handleAddTeamMembersChange = (value) => {
    handleInputChange('addTeamMembers', value);
    if (value === 'Yes') {
      setShowAddMemberModal(true);
    }
  };

  const validateNewMembers = () => {
    const errors = [];
    const duplicateCheck = new Set();
    
    for (let i = 0; i < newMembers.length; i++) {
      const member = newMembers[i];
      const memberErrors = {};
      
      if (!member.firstName?.trim()) memberErrors.firstName = `Member ${i + 1}: First Name is required`;
      if (!member.lastName?.trim()) memberErrors.lastName = `Member ${i + 1}: Last Name is required`;
      
      const fullName = `${member.firstName.toLowerCase()}_${member.lastName.toLowerCase()}`;
      if (duplicateCheck.has(fullName)) {
        memberErrors.duplicate = `Member ${i + 1}: Duplicate name in form`;
      } else {
        duplicateCheck.add(fullName);
      }
      
      const existingDuplicate = teamMembersDB.find(existingMember => 
        existingMember.firstName.toLowerCase() === member.firstName.toLowerCase() &&
        existingMember.lastName.toLowerCase() === member.lastName.toLowerCase()
      );
      if (existingDuplicate) {
        memberErrors.existingDuplicate = `Member ${i + 1}: Already exists in database`;
      }
      
      if (Object.keys(memberErrors).length > 0) {
        errors.push(...Object.values(memberErrors));
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };



  const handleAddNewMembers = async () => {
  const validation = validateNewMembers();
  if (validation.isValid) {
    setIsAddingMember(true);
    try {
      const membersData = newMembers
        .filter(member => member.firstName?.trim() && member.lastName?.trim())
        .map(member => ({
          firstName: member.firstName?.trim(),
          lastName: member.lastName?.trim(),
        }));

      const response = await axios.post(`${baseURL}/team-members/batch`, { members: membersData });
      
      if (response.data.success) {
        await fetchTeamMembers();
        setNewMembers([{ firstName: '', lastName: '' }]);
        setShowAddMemberModal(false);
        showNotification('success', `${response.data.data.length} team member(s) added successfully!`);
      } else {
        showNotification('error', response.data.message || 'Failed to add team members');
      }
    } catch (error) {
      console.error('Error adding team members:', error);
      if (error.response?.data?.message) {
        showNotification('error', error.response.data.message);
      } else {
        showNotification('error', 'Failed to add team members. Please try again.');
      }
    } finally {
      setIsAddingMember(false);
    }
  } else {
    showNotification('error', validation.errors.join(', '));
  }
};

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {

        const submitData = new FormData();

        Object.keys(formData).forEach(key => {
        if (key === 'teamMembers') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'companyLogo' && formData[key]) {
          submitData.append('companyLogo', formData[key]); 
        } else if (key !== 'companyLogo') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${baseURL}/projects`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
        if (response.data.success) {
          showNotification('success', 'Project saved successfully!');
          handleClear();
        } else if (response.data.errors && Array.isArray(response.data.errors)) {
          const errorMsgs = response.data.errors.map(e => e.msg).join(', ');
          showNotification('error', errorMsgs || 'Failed to save project');
        } else {
          showNotification('error', response.data.error || 'Failed to save project');
        }
      } catch (error) {
        console.error('Error saving project:', error);
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const errorMsgs = error.response.data.errors.map(e => e.msg).join(', ');
          showNotification('error', errorMsgs || 'Failed to save project');
        } else if (error.response?.data?.error) {
          showNotification('error', error.response.data.error);
        } else {
          showNotification('error', 'Failed to save project. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showNotification('error', 'Please fill in all required fields correctly');
    }
  };


const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('error', 'Please upload only JPG, JPEG, or PNG files');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; 
      if (file.size > maxSize) {
        showNotification('error', 'File size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      handleInputChange('companyLogo', file);
      
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const removeLogoFile = () => {
    setLogoFile(null);
    setShowPreview(false);
    setLogoPreview('');
    handleInputChange('companyLogo', null);
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleClear = () => {
    setFormData({
      clientCode: '',
      companyLogo: null,
      companyName: '',
      projectName: '',
      typeOfProject: 'Based on client',
      pvProjectManager: '',
      startDate: '',
      endDate: '',
      allottedBillingHours: '',
      department: '',
      teamMembers: [],
      addTeamMembers: 'No'
    });
    setLogoFile(null);
  setLogoPreview('');
  setErrors({});
  
  const fileInput = document.getElementById('logo-upload');
  if (fileInput) fileInput.value = '';
  };

  const handleClose = () => {
    if (Object.values(formData).some(value => Array.isArray(value) ? value.length > 0 : value?.trim() !== '')) {
      if (window.confirm('Are you sure you want to close? All unsaved changes will be lost.')) {
        handleClear();
      }
    }
  };

  const getSelectedMemberNames = () => {
    return formData.teamMembers
      .map(id => teamMembersDB.find(member => (member._id || member.id) === id))
      .filter(Boolean)
      .map(member => `${member.firstName} ${member.lastName}`)
      .join(', ');
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">

      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-black"
              : notification.type === "error"
              ? "bg-red-400 text-black"
              : "bg-blue-500 text-white"
          }`}
        >
          {notification.type === "success" && <CheckCircle size={20} />}
          {notification.type === "error" && <AlertCircle size={20} />}
          {notification.type === "info" && <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="relative max-w-full mx-auto rounded-lg overflow-hidden">
   
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
  
        <div className="relative z-10 p-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 text-sm mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100">
  
  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Client Code <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formData.clientCode}
      onChange={(e) =>
        handleInputChange("clientCode", e.target.value)
      }
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.clientCode
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      placeholder="Enter client code"
    />
    {errors.clientCode && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.clientCode}
      </p>
    )}
  </div>

<div className="space-y-1">
  <div className="flex items-center justify-between">
    <label htmlFor="logo-upload" className="block font-semibold text-sm text-gray-800">
      Company Logo
    </label>
    {logoPreview && (
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
    )}
  </div>

  <div className="relative pt-1">
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
      <Image size={16} />
    </div>
    <input
      type="file"
      id="logo-upload"
      accept=".jpg,.jpeg,.png"
      onChange={handleLogoUpload}
      className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700
        file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-gray-100
        file:text-gray-700 hover:file:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {logoPreview && showPreview && (
    <div className="mt-3">
      <p className="text-sm text-gray-500 mb-1">Preview:</p>

      <div className="relative w-20 h-20 border border-gray-300 rounded-md overflow-hidden bg-gray-50 shadow-sm">
        <img
          src={logoPreview}
          alt="Logo Preview"
          className="w-full h-full object-contain"
        />

        <button
          onClick={removeLogoFile}
          className="absolute top-1 right-1 bg-white text-gray-700 hover:bg-red-500 hover:text-white border border-gray-300 hover:border-red-600 rounded-full p-[2px] shadow-md transition-all duration-200"
          title="Remove Logo"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  )}
</div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Company Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formData.companyName}
      onChange={(e) =>
        handleInputChange("companyName", e.target.value)
      }
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.companyName
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      placeholder="Enter company name"
    />
    {errors.companyName && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.companyName}
      </p>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Project Name/No. <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formData.projectName}
      onChange={(e) =>
        handleInputChange("projectName", e.target.value)
      }
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.projectName
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      placeholder="Enter project name"
    />
    {errors.projectName && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.projectName}
      </p>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Type of Project
    </label>
    <Menu as="div" className="relative">
      <MenuButton className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex justify-between items-center text-left hover:border-gray-400 transition-all duration-200">
        <span className="text-gray-900">
          {formData.typeOfProject}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </MenuButton>
      <MenuItems className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
        {projectTypeOptions.map((option) => (
          <MenuItem key={option}>
            {({ active }) => (
              <button
                onClick={() =>
                  handleInputChange("typeOfProject", option)
                }
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      PV Project Manager
    </label>
    <Menu as="div" className="relative">
      <MenuButton className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex justify-between items-center text-left hover:border-gray-400 transition-all duration-200">
        <span className="text-gray-900">
          {formData.pvProjectManager}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </MenuButton>
      <MenuItems className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
        {projectManagerOptions.map((option) => (
          <MenuItem key={option}>
            {({ active }) => (
              <button
                onClick={() =>
                  handleInputChange("pvProjectManager", option)
                }
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Start Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.startDate}
      onChange={(e) =>
        handleInputChange("startDate", e.target.value)
      }
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.startDate
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    />
    {errors.startDate && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.startDate}
      </p>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      End Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.endDate}
      onChange={(e) => handleInputChange("endDate", e.target.value)}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.endDate
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    />
    {errors.endDate && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.endDate}
      </p>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Department <span className="text-red-500">*</span>
    </label>
    <Menu as="div" className="relative">
      <MenuButton
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent bg-white flex justify-between items-center text-left hover:border-gray-400
          transition-all duration-200 ${
            errors.department
              ? "border-red-400 bg-red-50"
              : "border-gray-300"
          }`}
      >
        <span
          className={
            formData.department ? "text-gray-900" : "text-gray-500"
          }
        >
          {formData.department || "Select Department"}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </MenuButton>
      <MenuItems className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
        {departmentOptions.map((option) => (
          <MenuItem key={option.value}>
            {({ active }) => (
              <button
                onClick={() =>
                  handleInputChange("department", option.value)
                }
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
    {errors.department && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.department}
      </p>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Allotted Billing Hours <span className="text-red-500">*</span>
    </label>
    <input
      type="number"
      value={formData.allottedBillingHours}
      onChange={(e) =>
        handleInputChange("allottedBillingHours", e.target.value)
      }
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-transparent transition-all duration-200 ${
        errors.allottedBillingHours
          ? "border-red-400 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      placeholder="Enter billing hours"
      min="0"
      step="0.5"
    />
    {errors.allottedBillingHours && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1"></span>
        {errors.allottedBillingHours}
      </p>
    )}
  </div>

  <div className="lg:col-span-1 xl:col-span-1 relative">
    <label className="block font-semibold text-gray-800 mb-2">
      Team Members
      {loadingTeamMembers && (
        <Loader className="inline ml-2 animate-spin" size={16} />
      )}
    </label>
    <button
      type="button"
      onClick={() => setShowTeamMembersDropdown((prev) => !prev)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400
        transition-all duration-200"
    >
      <span className="text-gray-900">
        {formData.teamMembers.length > 0
          ? getSelectedMemberNames()
          : "Select team members"}
      </span>
      <ChevronDownIcon
        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200
          ${showTeamMembersDropdown ? "rotate-180" : ""}`}
      />
    </button>
    {showTeamMembersDropdown && (
      <div className="absolute left-0 right-0 mt-1 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-white shadow-lg z-30">
        {loadingTeamMembers ? (
          <div className="flex items-center justify-center py-3">
            <Loader className="animate-spin" size={20} />
            <span className="ml-2 text-gray-500 text-sm">
              Loading team members...
            </span>
          </div>
        ) : teamMembersDB.length > 0 ? (
          teamMembersDB.map((member) => (
            <label
              key={member._id || member.id}
              className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded text-sm transition-colors duration-150"
            >
              <input
                type="checkbox"
                checked={formData.teamMembers.includes(
                  member._id || member.id
                )}
                onChange={() =>
                  handleTeamMemberToggle(member._id || member.id)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-gray-900">
                {member.firstName} {member.lastName}
              </span>
            </label>
          ))
        ) : (
          <p className="text-gray-500 text-sm py-2">
            No team members available
          </p>
        )}
      </div>
    )}
    {teamMembersError && (
      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        <span className="flex items-center">
          <span className="mr-1"></span>
          {teamMembersError}
        </span>
        <button
          onClick={fetchTeamMembers}
          className="ml-1 text-red-700 underline hover:text-red-800 transition-colors duration-150"
        >
          Retry
        </button>
      </div>
    )}
  </div>

  <div>
    <label className="block font-semibold text-gray-800 mb-2">
      Do you want to add Team Members?
    </label>
    <Menu as="div" className="relative">
      <MenuButton className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex justify-between items-center text-left hover:border-gray-400 transition-all duration-200">
        <span className="text-gray-900">
          {formData.addTeamMembers}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </MenuButton>
      <MenuItems className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
        {addTeamMembersOptions.map((option) => (
          <MenuItem key={option}>
            {({ active }) => (
              <button
                onClick={() => handleAddTeamMembersChange(option)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  </div>
</div>

          <div className="flex justify-center flex-wrap gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={12} />
              ) : (
                <Save size={12} />
              )}
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </button>

            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
            >
              <XCircle size={12} />
              <span>Close</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Add New Team Members
                </h3>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setNewMembers([{ firstName: "", lastName: "" }]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {newMembers.map((member, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-semibold text-gray-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Member {index + 1}
                      </span>
                      {newMembers.length > 1 && (
                        <button
                          onClick={() =>
                            setNewMembers((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.firstName}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[index].firstName = e.target.value;
                            setNewMembers(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.lastName}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[index].lastName = e.target.value;
                            setNewMembers(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button
                  onClick={() =>
                    setNewMembers((prev) => [
                      ...prev,
                      { firstName: "", lastName: "" },
                    ])
                  }
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium text-base p-2 rounded hover:bg-blue-50"
                >
                  <Plus size={16} />
                  Add Another Member
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddNewMembers}
                  disabled={isAddingMember}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-base shadow hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isAddingMember ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isAddingMember
                    ? "Adding..."
                    : `Add ${newMembers.length} Member${
                        newMembers.length > 1 ? "s" : ""
                      }`}
                </button>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setNewMembers([{ firstName: "", lastName: "" }]);
                  }}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold text-base shadow hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInformationForm;