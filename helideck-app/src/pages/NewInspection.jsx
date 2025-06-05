import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI, facilitiesAPI } from '../services/api';
import { useToast } from '../components/ToastSystem';
import { useAuth } from '../contexts/AuthContext';

const NewInspection = () => {
  const [form, setForm] = useState({
    facilityId: '',
    date: '',
    inspector: '',
    notes: '',
    files: [],
  });
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
        if (user?.name) {
          setForm(prev => ({ ...prev, inspector: user.name }));
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

  const handleFileChange = async (e) => {
    const filesArray = Array.from(e.target.files);
    
    // Convert files to base64 for storage
    const filePromises = filesArray.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const files = await Promise.all(filePromises);
      setForm((prev) => ({ ...prev, files }));
    } catch (error) {
      toast.error('Failed to process files');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.facilityId) {
      toast.error('Please select a facility');
      return;
    }

    setLoading(true);
    
    try {
      await inspectionsAPI.create({
        facilityId: form.facilityId,
        date: form.date,
        inspector: form.inspector,
        notes: form.notes,
        attachments: form.files
      });
      
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
              <option key={facility._id} value={facility._id}>
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
          <label className="block text-sm font-medium mb-1">Upload Photos / Checklist</label>
          <input type="file" name="files" onChange={handleFileChange} multiple accept="image/*,.pdf" className="block w-full text-sm text-gray-600" />
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
