// HelicardManagement.jsx - Enhanced with Toast Notifications
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, Search, X, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from './ToastSystem';

const HelicardManagement = () => {
  const toast = useToast();
  const [helicards, setHelicards] = useState([]);
  const [isLoadingHelicards, setIsLoadingHelicards] = useState(true);
  
  // Fetch helicards from backend API
  useEffect(() => {
    fetch('http://localhost:5001/api/helicards')
      .then(res => res.json())
      .then(data => {
        setHelicards(data);
        setIsLoadingHelicards(false);
      })
      .catch(error => {
        console.error('Error fetching helicards:', error);
        toast.error('Failed to load helicards');
        setIsLoadingHelicards(false);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedHelicard, setSelectedHelicard] = useState(null);

  // Check for expiring helicards on mount
  useEffect(() => {
    let timeoutId;
    
    const checkExpiringHelicards = () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringCards = helicards.filter(card => {
        const expiryDate = new Date(card.expiryDate);
        return expiryDate <= thirtyDaysFromNow && card.status === 'current';
      });
      
      if (expiringCards.length > 0) {
        // Remove any existing notification with this ID first
        toast.remove('expiring-helicards-alert');
        
        // Show a single notification for all expiring cards
        timeoutId = setTimeout(() => {
          toast.warning(`${expiringCards.length} helicard(s) expiring within 30 days`, {
            id: 'expiring-helicards-alert',
            action: () => setFilterStatus('expiring'),
            actionLabel: 'View Expiring',
            category: 'helicard'
          });
        }, 100);
      }
    };

    checkExpiringHelicards();
    
    // Cleanup function to remove notification and clear timeout
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      toast.remove('expiring-helicards-alert');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const filteredHelicards = helicards.filter(card => {
    const matchesSearch = card.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.operatingCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || card.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = async (helicard) => {
    const loadingId = Date.now();
    toast.loading(`Downloading ${helicard.facilityName} helicard...`, { id: loadingId });
    
    try {
      const response = await fetch(`http://localhost:5001/api/helicards/${helicard.id}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download helicard');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = helicard.fileName || `${helicard.facilityName}_helicard.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.remove(loadingId);
      toast.success('Helicard downloaded successfully!', { category: 'helicard' });
    } catch (error) {
      console.error('Error downloading helicard:', error);
      toast.remove(loadingId);
      toast.error('Failed to download helicard. Please try again.');
    }
  };

  const handleRequestUpdate = (helicard) => {
    toast.info(`Update request sent to ${helicard.uploadedBy} for ${helicard.facilityName}`, {
      action: () => console.log('View request details'),
      actionLabel: 'Track Request',
      category: 'helicard',
      persist: true
    });
  };

  const handleDeleteHelicard = async (helicardId) => {
    if (window.confirm('Are you sure you want to delete this helicard?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/helicards/${helicardId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete helicard');
        }
        
        setHelicards(prev => prev.filter(h => h.id !== helicardId));
        toast.success('Helicard deleted successfully', { category: 'helicard' });
      } catch (error) {
        console.error('Error deleting helicard:', error);
        toast.error('Failed to delete helicard. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Helicard Management</h1>
            <p className="text-gray-600 mt-1">Manage helideck information plates from PHI and Bristow</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Helicard
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Status</option>
          <option value="current">Current</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Helicards"
          value={helicards.length}
          icon={<FileText />}
          color="blue"
        />
        <SummaryCard
          title="Current"
          value={helicards.filter(h => h.status === 'current').length}
          icon={<CheckCircle />}
          color="green"
        />
        <SummaryCard
          title="Expiring Soon"
          value={helicards.filter(h => h.status === 'expiring').length}
          icon={<AlertCircle />}
          color="yellow"
        />
        <SummaryCard
          title="Non-Compliant"
          value={helicards.filter(h => !Object.values(h.compliance).every(v => v)).length}
          icon={<AlertCircle />}
          color="red"
        />
      </div>

      {/* Helicards Grid */}
      {isLoadingHelicards ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading helicards...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHelicards.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No helicards found. Upload your first helicard to get started.
            </div>
          ) : (
            filteredHelicards.map((helicard) => (
              <HelicardCard
                key={helicard.id}
                helicard={helicard}
                onView={() => setSelectedHelicard(helicard)}
                onDownload={() => handleDownload(helicard)}
                onDelete={() => handleDeleteHelicard(helicard.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadHelicardModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(newHelicard) => {
            setHelicards([...helicards, newHelicard]);
            setShowUploadModal(false);
            toast.success(`Helicard for ${newHelicard.facilityName} uploaded successfully!`, { category: 'helicard' });
          }}
        />
      )}

      {/* Helicard Details Modal */}
      {selectedHelicard && (
        <HelicardDetailsModal
          helicard={selectedHelicard}
          onClose={() => setSelectedHelicard(null)}
          onRequestUpdate={() => handleRequestUpdate(selectedHelicard)}
          onDownload={() => handleDownload(selectedHelicard)}
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
    red: 'bg-red-50 text-red-600'
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

// Enhanced HelicardCard component
const HelicardCard = ({ helicard, onView, onDownload, onDelete }) => {
  const toast = useToast();
  const statusConfig = {
    current: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Current' },
    expiring: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Expiring Soon' },
    expired: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Expired' }
  };

  const status = statusConfig[helicard.status];
  const hasComplianceIssues = !Object.values(helicard.compliance).every(v => v);

  const handleComplianceClick = () => {
    if (hasComplianceIssues) {
      const issues = Object.entries(helicard.compliance)
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
            <h3 className="text-lg font-semibold text-gray-900">{helicard.facilityName}</h3>
            <p className="text-sm text-gray-500 mt-1">{helicard.operatingCompany}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">D-Value:</span>
            <span className="font-medium text-gray-900">{helicard.dValue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Elevation:</span>
            <span className="font-medium text-gray-900">{helicard.elevation}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Expires:</span>
            <span className="font-medium text-gray-900">
              {new Date(helicard.expiryDate).toLocaleDateString()}
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
            aria-label="Delete helicard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Upload Modal with validation
const UploadHelicardModal = ({ onClose, onUpload }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    facilityName: '',
    operatingCompany: 'bp Asset',
    dValue: '',
    elevation: '',
    file: null,
    uploadedBy: 'PHI Aviation',
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
      toast.success('PDF file added successfully', { category: 'helicard' });
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, file });
      toast.success('PDF file added successfully', { category: 'helicard' });
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleSubmit = async () => {
    
    // Validation
    if (!formData.file) {
      toast.error('Please upload a helicard PDF');
      return;
    }
    
    if (!formData.facilityName || !formData.operatingCompany) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingId = Date.now();
    toast.loading('Uploading helicard...', { id: loadingId });

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
        
        const helicardData = {
          facilityName: formData.facilityName,
          operatingCompany: formData.operatingCompany,
          dValue: formData.dValue || '',
          elevation: formData.elevation || '',
          uploadedBy: formData.uploadedBy,
          fileName: formData.file.name,
          fileData: base64File,
          compliance: formData.compliance,
          lastUpdated: new Date().toISOString().split('T')[0],
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          version: '1.0',
          status: 'current'
        };

        const response = await fetch('http://localhost:5001/api/helicards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(helicardData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Upload failed:', response.status, errorData);
          throw new Error(`Failed to upload helicard: ${response.status} ${errorData}`);
        }

        const newHelicard = await response.json();
        
        toast.remove(loadingId);
        onUpload(newHelicard);
        } catch (error) {
          console.error('Error in upload process:', error);
          toast.remove(loadingId);
          toast.error('Failed to upload helicard. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900">Upload Helicard</h2>
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
              Helicard PDF *
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
              Upload Helicard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Details Modal
const HelicardDetailsModal = ({ helicard, onClose, onRequestUpdate, onDownload }) => {
  const toast = useToast();
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Fetch the full helicard data including file data when modal opens
  useEffect(() => {
    let currentUrl = null;
    
    const fetchHelicardDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/helicards/${helicard.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch helicard details');
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
        console.error('Error fetching helicard details:', error);
        toast.error('Failed to load PDF preview');
      }
    };
    
    fetchHelicardDetails();
    
    // Cleanup blob URL on unmount
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [helicard.id, toast]); // Keep toast in dependencies
  
  const handlePrint = () => {
    toast.info('Opening print dialog...');
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Helicard for ${helicard.facilityName} - ${window.location.href}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{helicard.facilityName}</h2>
              <p className="mt-1 opacity-90">{helicard.operatingCompany}</p>
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
              <h3 className="text-sm font-medium text-gray-500 mb-1">D-Value</h3>
              <p className="text-gray-900 font-medium">{helicard.dValue}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Elevation</h3>
              <p className="text-gray-900 font-medium">{helicard.elevation}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Version</h3>
              <p className="text-gray-900 font-medium">{helicard.version}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-900 font-medium">
                {new Date(helicard.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expires</h3>
              <p className="text-gray-900 font-medium">
                {new Date(helicard.expiryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Uploaded By</h3>
              <p className="text-gray-900 font-medium">{helicard.uploadedBy}</p>
            </div>
          </div>

          {/* Compliance Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(helicard.compliance).map(([key, value]) => (
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
                  title={`${helicard.facilityName} Helicard`}
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

export default HelicardManagement;