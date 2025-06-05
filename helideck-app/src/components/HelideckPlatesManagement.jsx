// HelideckPlatesManagement.jsx - Enhanced with Toast Notifications
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, Search, X, RefreshCw, Trash2, Grid, List } from 'lucide-react';
import { useToast } from './ToastSystem';

const HelideckPlatesManagement = () => {
  const toast = useToast();
  const [helideckPlates, setHelideckPlates] = useState([]);
  const [isLoadingHelideckPlates, setIsLoadingHelideckPlates] = useState(true);
  
  // Fetch helideck plates from backend API
  useEffect(() => {
    fetch('http://localhost:5001/api/helideck-plates')
      .then(res => res.json())
      .then(data => {
        setHelideckPlates(data);
        setIsLoadingHelideckPlates(false);
      })
      .catch(error => {
        console.error('Error fetching helideck plates:', error);
        toast.error('Failed to load helideck plates');
        setIsLoadingHelideckPlates(false);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOperator, setFilterOperator] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedHelideckPlate, setSelectedHelideckPlate] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Check for expiring helideck plates on mount
  useEffect(() => {
    let timeoutId;
    
    const checkExpiringHelideckPlates = () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringCards = helideckPlates.filter(card => {
        const expiryDate = new Date(card.expiryDate);
        return expiryDate <= thirtyDaysFromNow && card.status === 'current';
      });
      
      if (expiringCards.length > 0) {
        // Remove any existing notification with this ID first
        toast.remove('expiring-helideck-plates-alert');
        
        // Show a single notification for all expiring cards
        timeoutId = setTimeout(() => {
          toast.warning(`${expiringCards.length} helideck plate(s) expiring within 30 days`, {
            id: 'expiring-helideck-plates-alert',
            action: () => setFilterStatus('expiring'),
            actionLabel: 'View Expiring',
            category: 'helideck-plate'
          });
        }, 100);
      }
    };

    checkExpiringHelideckPlates();
    
    // Cleanup function to remove notification and clear timeout
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      toast.remove('expiring-helicards-alert');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const filteredHelideckPlates = helideckPlates.filter(card => {
    const matchesSearch = card.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.operatingCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || card.status === filterStatus;
    const matchesOperator = filterOperator === 'all' || card.uploadedBy === filterOperator;
    return matchesSearch && matchesFilter && matchesOperator;
  });

  const handleDownload = async (helideckPlate) => {
    const loadingId = Date.now();
    toast.loading(`Downloading ${helideckPlate.facilityName} helideck plate...`, { id: loadingId });
    
    try {
      const response = await fetch(`http://localhost:5001/api/helideck-plates/${helideckPlate.id}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download helideck plate');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = helideckPlate.fileName || `${helideckPlate.facilityName}_helideck_plate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.remove(loadingId);
      toast.success('Helideck plate downloaded successfully!', { category: 'helideck-plate' });
    } catch (error) {
      console.error('Error downloading helideck plate:', error);
      toast.remove(loadingId);
      toast.error('Failed to download helideck plate. Please try again.');
    }
  };

  const handleRequestUpdate = (helideckPlate) => {
    toast.info(`Update request sent to ${helideckPlate.uploadedBy} for ${helideckPlate.facilityName}`, {
      action: () => console.log('View request details'),
      actionLabel: 'Track Request',
      category: 'helideck-plate',
      persist: true
    });
  };

  const handleDeleteHelideckPlate = async (helideckPlateId) => {
    if (window.confirm('Are you sure you want to delete this helideck plate?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/helideck-plates/${helideckPlateId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete helideck plate');
        }
        
        setHelideckPlates(prev => prev.filter(h => h.id !== helideckPlateId));
        toast.success('Helideck plate deleted successfully', { category: 'helideck-plate' });
      } catch (error) {
        console.error('Error deleting helideck plate:', error);
        toast.error('Failed to delete helideck plate. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Helideck Plates Management</h1>
            <p className="text-gray-600 mt-1">Manage helideck information plates from PHI and Bristow</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Helideck Plate
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by facility name or operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <select
          value={filterOperator}
          onChange={(e) => setFilterOperator(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Operators</option>
          <option value="PHI">PHI Only</option>
          <option value="Bristow">Bristow Only</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Status</option>
          <option value="current">Current</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Table View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Operator Comparison */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-700 font-bold">PHI</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">PHI Aviation</p>
                  <p className="text-sm text-gray-500">{helideckPlates.filter(h => h.uploadedBy === 'PHI').length} helideck plates</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Compliance Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {helideckPlates.filter(h => h.uploadedBy === 'PHI').length > 0 
                    ? Math.round((helideckPlates.filter(h => h.uploadedBy === 'PHI' && Object.values(h.compliance).every(v => v)).length / helideckPlates.filter(h => h.uploadedBy === 'PHI').length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-700 font-bold">B</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bristow Helicopters</p>
                  <p className="text-sm text-gray-500">{helideckPlates.filter(h => h.uploadedBy === 'Bristow').length} helideck plates</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Compliance Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {helideckPlates.filter(h => h.uploadedBy === 'Bristow').length > 0 
                    ? Math.round((helideckPlates.filter(h => h.uploadedBy === 'Bristow' && Object.values(h.compliance).every(v => v)).length / helideckPlates.filter(h => h.uploadedBy === 'Bristow').length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <SummaryCard
          title="Total Plates"
          value={helideckPlates.length}
          icon={<FileText />}
          color="blue"
        />
        <SummaryCard
          title="PHI Plates"
          value={helideckPlates.filter(h => h.uploadedBy === 'PHI').length}
          icon={<FileText />}
          color="purple"
        />
        <SummaryCard
          title="Bristow Plates"
          value={helideckPlates.filter(h => h.uploadedBy === 'Bristow').length}
          icon={<FileText />}
          color="orange"
        />
        <SummaryCard
          title="Current"
          value={helideckPlates.filter(h => h.status === 'current').length}
          icon={<CheckCircle />}
          color="green"
        />
        <SummaryCard
          title="Expiring"
          value={helideckPlates.filter(h => h.status === 'expiring').length}
          icon={<AlertCircle />}
          color="yellow"
        />
        <SummaryCard
          title="Non-Compliant"
          value={helideckPlates.filter(h => !Object.values(h.compliance).every(v => v)).length}
          icon={<AlertCircle />}
          color="red"
        />
      </div>

      {/* Helideck Plates Display */}
      {isLoadingHelideckPlates ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading helideck plates...</div>
        </div>
      ) : (
        <>
          {filteredHelideckPlates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No helideck plates found. Upload your first helideck plate to get started.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHelideckPlates.map((helideckPlate) => (
                <HelideckPlateCard
                  key={helideckPlate.id}
                  helideckPlate={helideckPlate}
                  onView={() => setSelectedHelideckPlate(helideckPlate)}
                  onDownload={() => handleDownload(helideckPlate)}
                  onDelete={() => handleDeleteHelideckPlate(helideckPlate.id)}
                />
              ))}
            </div>
          ) : (
            <HelideckPlatesTable
              helideckPlates={filteredHelideckPlates}
              onView={setSelectedHelideckPlate}
              onDownload={handleDownload}
              onDelete={handleDeleteHelideckPlate}
            />
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadHelideckPlateModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(newHelideckPlate) => {
            setHelideckPlates([...helideckPlates, newHelideckPlate]);
            setShowUploadModal(false);
            toast.success(`Helideck plate for ${newHelideckPlate.facilityName} uploaded successfully!`, { category: 'helideck-plate' });
          }}
        />
      )}

      {/* Helideck Plate Details Modal */}
      {selectedHelideckPlate && (
        <HelideckPlateDetailsModal
          helideckPlate={selectedHelideckPlate}
          onClose={() => setSelectedHelideckPlate(null)}
          onRequestUpdate={() => handleRequestUpdate(selectedHelideckPlate)}
          onDownload={() => handleDownload(selectedHelideckPlate)}
        />
      )}
    </div>
  );
};

// SummaryCard component
const SummaryCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Enhanced HelideckPlateCard component
const HelideckPlateCard = ({ helideckPlate, onView, onDownload, onDelete }) => {
  const toast = useToast();
  const statusConfig = {
    current: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Current' },
    expiring: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Expiring Soon' },
    expired: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Expired' }
  };

  const status = statusConfig[helideckPlate.status];
  const hasComplianceIssues = !Object.values(helideckPlate.compliance).every(v => v);

  const handleComplianceClick = () => {
    if (hasComplianceIssues) {
      const issues = Object.entries(helideckPlate.compliance)
        .filter(([_, value]) => !value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
        .join(', ');
      
      toast.warning(`Compliance issues: ${issues}`, {
        action: onView,
        actionLabel: 'View Details'
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{helideckPlate.facilityName}</h3>
            <p className="text-sm text-gray-500 mt-1">{helideckPlate.operatingCompany}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
              {status.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              helideckPlate.uploadedBy === 'PHI' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {helideckPlate.uploadedBy}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tonnage:</span>
            <span className="font-medium text-gray-900">{helideckPlate.tonnage || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">D-Value:</span>
            <span className="font-medium text-gray-900">{helideckPlate.dValue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fuel:</span>
            <span className="font-medium text-gray-900">{helideckPlate.fuel || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Expires:</span>
            <span className="font-medium text-gray-900">
              {new Date(helideckPlate.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {hasComplianceIssues && (
          <div 
            onClick={handleComplianceClick}
            className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Compliance Issues Detected
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button 
            onClick={onDownload}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            aria-label="Delete helideck plate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Upload Modal with validation
const UploadHelideckPlateModal = ({ onClose, onUpload }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    facilityName: '',
    operatingCompany: 'bp Asset',
    dValue: '',
    elevation: '',
    tonnage: '',
    fuel: '',
    file: null,
    uploadedBy: 'PHI',
    compliance: {
      frequencyPainted: false,
      tdpmCircle: false,
      lightingSystem: false,
      obstaclesFree: false
    }
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, file });
      toast.success('PDF file added successfully', { category: 'helideck-plate' });
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, file });
      toast.success('PDF file added successfully', { category: 'helideck-plate' });
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleSubmit = async () => {
    
    // Validation
    if (!formData.file) {
      toast.error('Please upload a helideck plate PDF');
      return;
    }
    
    if (!formData.facilityName || !formData.operatingCompany) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingId = Date.now();
    toast.loading('Uploading helideck plate...', { id: loadingId });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.remove(loadingId);
        toast.error('Failed to read file. Please try again.');
      };
      reader.onloadend = async () => {
        try {
          const base64File = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        const helideckPlateData = {
          facilityName: formData.facilityName,
          operatingCompany: formData.operatingCompany,
          dValue: formData.dValue || '',
          elevation: formData.elevation || '',
          tonnage: formData.tonnage || '',
          fuel: formData.fuel || '',
          uploadedBy: formData.uploadedBy,
          fileName: formData.file.name,
          fileData: base64File,
          compliance: formData.compliance,
          lastUpdated: new Date().toISOString().split('T')[0],
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          version: '1.0',
          status: 'current'
        };

        const response = await fetch('http://localhost:5001/api/helideck-plates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(helideckPlateData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Upload failed:', response.status, errorData);
          throw new Error(`Failed to upload helideck plate: ${response.status} ${errorData}`);
        }

        const newHelideckPlate = await response.json();
        
        toast.remove(loadingId);
        onUpload(newHelideckPlate);
        } catch (error) {
          console.error('Error in upload process:', error);
          toast.remove(loadingId);
          toast.error('Failed to upload helideck plate. Please try again.');
        }
      };
      
      reader.readAsDataURL(formData.file);
    } catch (error) {
      console.error('Error starting upload:', error);
      toast.remove(loadingId);
      toast.error('Failed to start upload. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Helideck Plate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Helideck Plate PDF *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your PDF here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-green-600 font-medium hover:text-green-700"
              >
                Browse Files
              </label>
              {formData.file && (
                <p className="mt-3 text-sm text-green-600 font-medium">
                  ✓ {formData.file.name}
                </p>
              )}
            </div>
          </div>

          {/* Facility Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility Name *
              </label>
              <input
                type="text"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Atlantis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Company *
              </label>
              <select
                value={formData.operatingCompany}
                onChange={(e) => setFormData({ ...formData, operatingCompany: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="bp Asset">bp Asset</option>
                <option value="Third-Party Vessel">Third-Party Vessel</option>
              </select>
            </div>
          </div>

          {/* Uploaded By (PHI or Bristow) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operator / Uploaded By *
            </label>
            <select
              value={formData.uploadedBy}
              onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="PHI">PHI</option>
              <option value="Bristow">Bristow</option>
            </select>
          </div>

          {/* Helideck Specifications */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                D-Value
              </label>
              <input
                type="text"
                value={formData.dValue}
                onChange={(e) => setFormData({ ...formData, dValue: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 21.0m"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elevation
              </label>
              <input
                type="text"
                value={formData.elevation}
                onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 120'"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tonnage
              </label>
              <input
                type="text"
                value={formData.tonnage}
                onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 12.8t"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel
              </label>
              <input
                type="text"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Jet A"
              />
            </div>
          </div>

          {/* Compliance Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Compliance Status</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.compliance.frequencyPainted}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, frequencyPainted: e.target.checked }
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700">Frequency Painted</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.compliance.tdpmCircle}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, tdpmCircle: e.target.checked }
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700">TDPM Circle</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.compliance.lightingSystem}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, lightingSystem: e.target.checked }
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700">Lighting System</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.compliance.obstaclesFree}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, obstaclesFree: e.target.checked }
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700">Obstacles Free</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.file || !formData.facilityName || !formData.operatingCompany}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Upload Helideck Plate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Details Modal
const HelideckPlateDetailsModal = ({ helideckPlate, onClose, onRequestUpdate, onDownload }) => {
  const toast = useToast();
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Fetch the full helideck plate data including file data when modal opens
  useEffect(() => {
    let currentUrl = null;
    
    const fetchHelideckPlateDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/helideck-plates/${helideckPlate.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch helideck plate details');
        }
        const data = await response.json();
        
        // Create blob URL from base64 data
        if (data.fileData) {
          const byteCharacters = atob(data.fileData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          currentUrl = url;
          setPdfUrl(url);
        }
      } catch (error) {
        console.error('Error fetching helideck plate details:', error);
        toast.error('Failed to load PDF preview');
      }
    };
    
    fetchHelideckPlateDetails();
    
    // Cleanup blob URL on unmount
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [helideckPlate.id, toast]); // Keep toast in dependencies
  
  const handlePrint = () => {
    toast.info('Opening print dialog...');
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Helideck plate for ${helideckPlate.facilityName} - ${window.location.href}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`text-white p-6 ${
          helideckPlate.uploadedBy === 'PHI' 
            ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
            : 'bg-gradient-to-r from-orange-600 to-orange-700'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="font-semibold">{helideckPlate.uploadedBy}</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">{helideckPlate.facilityName}</h2>
              <p className="mt-1 opacity-90">{helideckPlate.operatingCompany}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tonnage</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.tonnage || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">D-Value</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.dValue}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Fuel</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.fuel || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Elevation</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.elevation}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-900 font-medium">
                {new Date(helideckPlate.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expires</h3>
              <p className="text-gray-900 font-medium">
                {new Date(helideckPlate.expiryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Operator</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.uploadedBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Version</h3>
              <p className="text-gray-900 font-medium">{helideckPlate.version}</p>
            </div>
          </div>

          {/* Compliance Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(helideckPlate.compliance).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  {value ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Compliant
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      Non-Compliant
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PDF Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title={`${helideckPlate.facilityName} Helideck Plate`}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    {pdfUrl === null ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading PDF preview...</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">PDF preview not available</p>
                        <button 
                          onClick={onDownload}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Download className="w-4 h-4" />
                          Download Full PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-3">
              <button 
                onClick={onRequestUpdate}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Request Update
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Print
              </button>
              <button 
                onClick={handleShare}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Share
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table View Component
const HelideckPlatesTable = ({ helideckPlates, onView, onDownload, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tonnage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                D-Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {helideckPlates.map((plate) => {
              const statusConfig = {
                current: { color: 'bg-green-100 text-green-800', label: 'Current' },
                expiring: { color: 'bg-amber-100 text-amber-800', label: 'Expiring' },
                expired: { color: 'bg-red-100 text-red-800', label: 'Expired' }
              };
              const status = statusConfig[plate.status];
              const hasComplianceIssues = !Object.values(plate.compliance).every(v => v);
              
              return (
                <tr key={plate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plate.facilityName}</div>
                      <div className="text-sm text-gray-500">{plate.operatingCompany}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      plate.uploadedBy === 'PHI' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {plate.uploadedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plate.tonnage || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plate.dValue || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plate.fuel || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(plate.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasComplianceIssues ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Issues
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Compliant
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(plate)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownload(plate)}
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(plate.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HelideckPlatesManagement;