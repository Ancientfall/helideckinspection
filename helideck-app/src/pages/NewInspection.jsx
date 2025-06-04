import React, { useState } from 'react';
import { saveInspection } from '../utils/localStorageUtils';
import { facilities } from '../utils/facilities';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const NewInspection = () => {
  const [form, setForm] = useState({
    facility: '',
    date: '',
    inspector: '',
    notes: '',
    files: [],
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, files: filesArray }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInspection = {
      ...form,
      id: uuidv4(),
      files: form.files.map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    };
    saveInspection(newInspection);
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">New Helideck Inspection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Facility</label>
          <select name="facility" value={form.facility} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="" disabled>Select a facility</option>
            {facilities.map((fac) => (
              <option key={fac} value={fac}>{fac}</option>
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Inspection</button>
      </form>
    </div>
  );
};

export default NewInspection;
