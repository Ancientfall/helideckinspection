import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI, facilitiesAPI } from '../services/api';
import { useToast } from '../components/ToastSystem';
import { useAuth } from '../contexts/AuthContext';

const NewInspection = () => {
  const [form, setForm] = useState({
    facilityId: '',
    facilityName: '',
    date: '',
    inspector: '',
    helideckCondition: 'Good',
    lightingStatus: 'Operational',
    perimeterNetStatus: 'Intact',
    frictionTestResult: 'Pass',
    overallStatus: 'Compliant',
    notes: '',
  });
  const [files, setFiles] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load facilities on component mount
    const fetchFacilities = async () => {
      try {
        const data = await facilitiesAPI.getAll();
        setFacilities(data);
        // Pre-fill inspector name with logged-in user
        if (user?.username) {
          setForm(prev => ({ ...prev, inspector: user.username }));
        }
      } catch (error) {
        toast.error('Failed to load facilities: ' + error.message);
      } finally {
        setLoadingFacilities(false);
      }
    };

    fetchFacilities();
  }, [user, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = filesArray.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length + files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.facilityId) {
      toast.error('Please select a facility');
      return;
    }
    
    // Get facility name from selected facility
    const selectedFacility = facilities.find(f => f.id === form.facilityId);
    if (!selectedFacility) {
      toast.error('Invalid facility selected');
      return;
    }

    setLoading(true);
    
    try {
      await inspectionsAPI.create({
        facility_id: form.facilityId,
        facility_name: selectedFacility.name,
        inspection_date: form.date,
        inspector_name: form.inspector,
        helideck_condition: form.helideckCondition,
        lighting_status: form.lightingStatus,
        perimeter_net_status: form.perimeterNetStatus,
        friction_test_result: form.frictionTestResult,
        overall_status: form.overallStatus,
        notes: form.notes
      }, files);
      
      toast.success('Inspection saved successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save inspection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingFacilities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading facilities...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">New Helideck Inspection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Facility</label>
          <select 
            name="facilityId" 
            value={form.facilityId} 
            onChange={handleChange} 
            required 
            className="w-full border p-2 rounded"
          >
            <option value="" disabled>Select a facility</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Inspection Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Inspector Name</label>
          <input type="text" name="inspector" value={form.inspector} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Inspection Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" className="w-full border p-2 rounded" placeholder="Include checklist observations, weather, or remarks" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Helideck Condition</label>
          <select name="helideckCondition" value={form.helideckCondition} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lighting Status</label>
          <select name="lightingStatus" value={form.lightingStatus} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Operational">Operational</option>
            <option value="Partially Operational">Partially Operational</option>
            <option value="Non-Operational">Non-Operational</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Perimeter Net Status</label>
          <select name="perimeterNetStatus" value={form.perimeterNetStatus} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Intact">Intact</option>
            <option value="Damaged">Damaged</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Friction Test Result</label>
          <select name="frictionTestResult" value={form.frictionTestResult} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Not Tested">Not Tested</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Overall Status</label>
          <select name="overallStatus" value={form.overallStatus} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="Requires Attention">Requires Attention</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Photos / Checklist</label>
          <input type="file" name="files" onChange={handleFileChange} multiple accept="image/*,.pdf,.doc,.docx" className="block w-full text-sm text-gray-600" />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {files.length} file(s) selected
              <button 
                type="button" 
                onClick={() => setFiles([])}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Inspection'}
        </button>
      </form>
    </div>
  );
};

export default NewInspection;
