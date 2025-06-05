import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilitiesAPI } from '../services/api';
import { useToast } from './ToastSystem';

const FacilityForm = ({ facility, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    operator: '',
    type: 'Fixed'
  });

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        location: facility.location || '',
        operator: facility.operator || '',
        type: facility.type || 'Fixed'
      });
    }
  }, [facility]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.location || !formData.operator) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      if (facility) {
        // Update existing facility
        await facilitiesAPI.update(facility.id, formData);
        showToast('Facility updated successfully', 'success');
      } else {
        // Create new facility
        await facilitiesAPI.create(formData);
        showToast('Facility created successfully', 'success');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving facility:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save facility';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {facility ? 'Edit Facility' : 'Add New Facility'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Facility Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Thunder Horse"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Gulf of Mexico"
            required
          />
        </div>

        <div>
          <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">
            Operator *
          </label>
          <input
            type="text"
            id="operator"
            name="operator"
            value={formData.operator}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., BP"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Facility Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Fixed">Fixed Platform</option>
            <option value="Floating">Floating Platform</option>
            <option value="FPSO">FPSO</option>
            <option value="Semisubmersible">Semisubmersible</option>
            <option value="Drillship">Drillship</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : facility ? 'Update Facility' : 'Create Facility'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacilityForm;