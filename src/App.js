import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProjectInformationForm from './components/ProjectInformationForm';
import ProjectDisplayPage from './components/ProjectDisplayPage';


const App = () => {
  const [currentPage, setCurrentPage] = useState('add-project');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const handleSaveProject = (projectData) => {
    if (editingProject !== null) {
      setProjects(prev => prev.map((project, index) => 
        index === editingProject ? projectData : project
      ));
      setEditingProject(null);
    } else {
      setProjects(prev => [...prev, projectData]);
    }
    setCurrentPage('view-projects');
  };

  const handleEditProject = (project) => {
    const projectIndex = projects.findIndex(p => p === project);
    setEditingProject(projectIndex);
    setCurrentPage('add-project');
  };

  const handleDeleteProject = (index) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePageChange = (page) => {
    if (page === 'add-project' && editingProject !== null) {
      setEditingProject(null);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'add-project':
        return (
          <ProjectInformationForm 
            onSave={handleSaveProject}
            editingProject={editingProject !== null ? projects[editingProject] : null}
            isEditing={editingProject !== null}
          />
        );
      case 'view-projects':
        return (
          <ProjectDisplayPage 
            projects={projects}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      default:
        return <ProjectInformationForm projectCount={projects.length} projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        projectCount={projects.length}
      />
      {renderPage()}
    </div>
  );
};

export default App;