import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInspections } from '../utils/localStorageUtils';
import { formatDate } from '../utils/dateUtils';

const FacilityDetails = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const all = getInspections();
    const filtered = all.filter((i) => i.facility === id);
    setRecords(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">{id} - Inspection History</h1>
      {records.length === 0 ? (
        <p className="text-gray-600">No inspections on record for this facility.</p>
      ) : (
        <ul className="space-y-4">
          {records.map((rec) => (
            <li key={rec.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{formatDate(rec.date)}</p>
                  <p className="font-medium">Inspector: {rec.inspector}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{rec.notes}</p>
              {rec.files.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {rec.files.map((file, i) => (
                      <li key={i}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
