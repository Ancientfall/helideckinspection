import React, { useEffect, useState } from 'react';
import { getInspectionStatus } from '../utils/dateUtils';
import StatusPieChart from '../components/StatusPieChart';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI, facilitiesAPI } from '../services/api';
import { useToast } from '../components/ToastSystem';

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [latestByFacility, setLatestByFacility] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch facilities and inspections
        const [facilitiesData, inspectionsData] = await Promise.all([
          facilitiesAPI.getAll(),
          inspectionsAPI.getAll()
        ]);
        
        setFacilities(facilitiesData);

        // Group inspections by facility
        const grouped = {};
        facilitiesData.forEach(facility => {
          const facilityInspections = inspectionsData
            .filter(i => i.facilityId === facility._id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          if (facilityInspections.length > 0) {
            grouped[facility._id] = {
              ...facilityInspections[0],
              facilityName: facility.name
            };
          }
        });

        setLatestByFacility(grouped);

        // Calculate status summary
        const statusGroups = {
          'Up to date': 0,
          'Due in 90 days': 0,
          'Due in 60 days': 0,
          'Due in 30 days': 0,
          'OVERDUE': 0,
        };

        Object.values(grouped).forEach((inspection) => {
          const { label } = getInspectionStatus(inspection.date);
          if (statusGroups[label] !== undefined) statusGroups[label]++;
        });

        const chartData = Object.entries(statusGroups).map(([label, value]) => ({ label, value }));
        setSummary(chartData);
      } catch (error) {
        toast.error('Failed to load dashboard data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Helideck Inspection Dashboard</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">Inspection Status Summary</h2>
        <StatusPieChart data={summary} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map((facility) => {
          const latest = latestByFacility[facility._id];
          const status = latest ? getInspectionStatus(latest.date) : { label: 'No Records', color: 'bg-gray-300' };
          return (
            <div
              key={facility._id}
              className="p-4 border rounded shadow bg-white cursor-pointer hover:shadow-md"
              onClick={() => navigate(`/facility/${facility._id}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{facility.name}</h3>
                <span className={`text-white text-sm px-2 py-1 rounded ${status.color}`}>{status.label}</span>
              </div>
              {latest ? (
                <p className="text-sm text-gray-600">Last: {new Date(latest.date).toLocaleDateString()} by {latest.inspector}</p>
              ) : (
                <p className="text-sm text-gray-400">No inspection on record.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
