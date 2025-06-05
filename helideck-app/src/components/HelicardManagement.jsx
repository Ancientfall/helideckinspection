import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { useToast } from './ToastSystem';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

const HelicardManagement = () => {
  const toast = useToast();
  const [helicards, setHelicards] = useState([]);
  const [filteredHelicards, setFilteredHelicards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedHelicard, setSelectedHelicard] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock facilities - should match your facilities.js
  const facilities = [
    'Atlantis', 'Argos', 'Na Kika', 'Thunder Horse',
    'Mad Dog', 'Holstein', 'Horn Mountain', 'Marlin', 'Petronius'
  ];

  // Load helicards from localStorage on mount
  useEffect(() => {
    const storedHelicards = localStorage.getItem('helicards');
    if (storedHelicards) {
      setHelicards(JSON.parse(storedHelicards));
    } else {
      // Initialize with sample data
      const sampleHelicards = [
        {
          id: '1',
          facilityName: 'Atlantis',
          uploadDate: '2024-01-15',
          expiryDate: '2024-07-15',
          fileName: 'ATL-HC-2024-01.pdf',
          fileSize: '2.3 MB',
          status: 'active',
          uploadedBy: 'John Doe',
          version: '1.0',
          notes: 'Annual helicard update'
        },
        {
          id: '2',
          facilityName: 'Thunder Horse',
          uploadDate: '2024-01-10',
          expiryDate: '2024-07-10',
          fileName: 'THD-HC-2024-01.pdf',
          fileSize: '1.8 MB',
          status: 'active',
          uploadedBy: 'Jane Smith',
          version: '1.0',
          notes: 'Updated deck markings section'
        }
      ];
      setHelicards(sampleHelicards);
      localStorage.setItem('helicards', JSON.stringify(sampleHelicards));
    }
  }, []);

  // Filter helicards based on search and filters
  useEffect(() => {
    let filtered = [...helicards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Facility filter
    if (selectedFacility !== 'all') {
      filtered = filtered.filter(card => card.facilityName === selectedFacility);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'expiringSoon') {
      filtered = filtered.filter(card => {
        const expiryDate = parseISO(card.expiryDate);
        return isAfter(expiryDate, now) && isBefore(expiryDate, addDays(now, 30));
      });
    } else if (dateFilter === 'expired') {
      filtered = filtered.filter(card => {
        const expiryDate = parseISO(card.expiryDate);
        return isBefore(expiryDate, now);
      });
    }

    setFilteredHelicards(filtered);
  }, [searchTerm, selectedFacility, dateFilter, helicards]);

  const getStatusConfig = (helicard) => {
    const now = new Date();
    const expiryDate = parseISO(helicard.expiryDate);
    
    if (isBefore(expiryDate, now)) {
      return {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Expired'
      };
    } else if (isBefore(expiryDate, addDays(now, 30))) {
      return {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock className="w-4 h-4" />,
        label: 'Expiring Soon'
      };
    } else {
      return {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Active'
      };
    }
  };

  const handleUpload = (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create new helicard
    setTimeout(() => {
      const newHelicard = {
        id: Date.now().toString(),
        facilityName: selectedFacility === 'all' ? 'Atlantis' : selectedFacility,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: addDays(new Date(), 180).toISOString().split('T')[0],
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'active',
        uploadedBy: 'Current User',
        version: '1.0',
        notes: ''
      };

      const updatedHelicards = [...helicards, newHelicard];
      setHelicards(updatedHelicards);
      localStorage.setItem('helicards', JSON.stringify(updatedHelicards));
      
      toast.success(`Helicard uploaded successfully for ${newHelicard.facilityName}`);
      setShowUploadModal(false);
      setUploadProgress(0);
    }, 2000);
  };

  const handleDelete = (helicardId) => {
    const helicard = helicards.find(h => h.id === helicardId);
    if (!helicard) return;

    if (window.confirm(`Are you sure you want to delete the helicard for ${helicard.facilityName}?`)) {
      const updatedHelicards = helicards.filter(h => h.id !== helicardId);
      setHelicards(updatedHelicards);
      localStorage.setItem('helicards', JSON.stringify(updatedHelicards));
      toast.success('Helicard deleted successfully');
    }
  };

  const handleDownload = (helicard) => {
    toast.info(`Downloading ${helicard.fileName}...`);
    // In a real app, this would trigger an actual file download
    setTimeout(() => {
      toast.success('Download completed');
    }, 1000);
  };

  const handlePreview = (helicard) => {
    setSelectedHelicard(helicard);
    setShowPreviewModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Helicard Management</h1>
        <p className="text-gray-600">Manage and track helicard documents for all facilities</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search helicards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Facility Filter */}
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Facilities</option>
            {facilities.map(facility => (
              <option key={facility} value={facility}>{facility}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiringSoon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Helicard
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Helicards"
          value={helicards.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          title="Active"
          value={helicards.filter(h => getStatusConfig(h).label === 'Active').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <SummaryCard
          title="Expiring Soon"
          value={helicards.filter(h => getStatusConfig(h).label === 'Expiring Soon').length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <SummaryCard
          title="Expired"
          value={helicards.filter(h => getStatusConfig(h).label === 'Expired').length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Helicards Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHelicards.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No helicards found
                  </td>
                </tr>
              ) : (
                filteredHelicards.map((helicard) => {
                  const statusConfig = getStatusConfig(helicard);
                  return (
                    <tr key={helicard.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{helicard.facilityName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{helicard.fileName}</div>
                            <div className="text-xs text-gray-500">{helicard.fileSize}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(parseISO(helicard.uploadDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(parseISO(helicard.expiryDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {helicard.uploadedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(helicard)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(helicard)}
                            className="text-green-600 hover:text-green-700"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(helicard.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          uploadProgress={uploadProgress}
          facilities={facilities}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedHelicard && (
        <PreviewModal
          helicard={selectedHelicard}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, uploadProgress, facilities }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

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
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0 && selectedFacility) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Helicard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Facility Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Facility
          </label>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Choose a facility...</option>
            {facilities.map(facility => (
              <option key={facility} value={facility}>{facility}</option>
            ))}
          </select>
        </div>

        {/* Expiry Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {selectedFiles.length > 0
              ? `Selected: ${selectedFiles[0].name}`
              : 'Drag and drop your PDF here, or click to browse'}
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
            className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
          >
            Choose file
          </label>
        </div>

        {/* Notes */}
        <div className="mb-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Add any relevant notes..."
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFiles.length || !selectedFacility || uploadProgress > 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadProgress > 0 ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ helicard, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Helicard Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Helicard Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Facility</p>
            <p className="font-medium">{helicard.facilityName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">File Name</p>
            <p className="font-medium">{helicard.fileName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Upload Date</p>
            <p className="font-medium">{format(parseISO(helicard.uploadDate), 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expiry Date</p>
            <p className="font-medium">{format(parseISO(helicard.expiryDate), 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Uploaded By</p>
            <p className="font-medium">{helicard.uploadedBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Version</p>
            <p className="font-medium">{helicard.version}</p>
          </div>
        </div>

        {helicard.notes && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Notes</p>
            <p className="text-gray-800">{helicard.notes}</p>
          </div>
        )}

        {/* PDF Preview Placeholder */}
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">PDF preview would be displayed here</p>
          <p className="text-sm text-gray-500 mt-2">
            In a production environment, this would show the actual PDF content
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelicardManagement;