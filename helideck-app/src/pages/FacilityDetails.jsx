import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { inspectionsAPI, facilitiesAPI } from '../services/api';
import { useToast } from '../components/ToastSystem';

const FacilityDetails = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch facility details and inspections
        const [facilityData, inspectionsData] = await Promise.all([
          facilitiesAPI.getById(id),
          inspectionsAPI.getByFacility(id)
        ]);
        
        setFacility(facilityData);
        setRecords(inspectionsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        toast.error('Failed to load facility details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading facility details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">
        {facility?.name || 'Unknown Facility'} - Inspection History
      </h1>
      
      {facility && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h2 className="text-lg font-medium mb-2">Facility Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span> {facility.type}
            </div>
            <div>
              <span className="font-medium">Location:</span> {facility.location}
            </div>
            {facility.coordinates && (
              <div>
                <span className="font-medium">Coordinates:</span> {facility.coordinates.latitude}, {facility.coordinates.longitude}
              </div>
            )}
            {facility.helideckDetails && (
              <div>
                <span className="font-medium">Helideck Type:</span> {facility.helideckDetails.type}
              </div>
            )}
          </div>
        </div>
      )}
      
      {records.length === 0 ? (
        <p className="text-gray-600">No inspections on record for this facility.</p>
      ) : (
        <ul className="space-y-4">
          {records.map((rec) => (
            <li key={rec._id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{formatDate(rec.date)}</p>
                  <p className="font-medium">Inspector: {rec.inspector}</p>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {rec._id}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{rec.notes || 'No notes provided'}</p>
              {rec.attachments && rec.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {rec.attachments.map((file, i) => (
                      <li key={i}>
                        <a 
                          href={file.data || file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FacilityDetails;
