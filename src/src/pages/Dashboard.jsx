import React, { useEffect, useState } from 'react';
import { getInspections } from '../utils/localStorageUtils';
import { getInspectionStatus } from '../utils/dateUtils';
import { facilities } from '../utils/facilities';
import StatusPieChart from '../components/StatusPieChart';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [latestByFacility, setLatestByFacility] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const inspections = getInspections();

    const grouped = facilities.reduce((acc, fac) => {
      const latest = inspections
        .filter((i) => i.facility === fac)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      if (latest) acc[fac] = latest;
      return acc;
    }, {});

    setLatestByFacility(grouped);

    const statusGroups = {
      'Up to date': 0,
      'Due in 90 days': 0,
      'Due in 60 days': 0,
      'Due in 30 days': 0,
      'OVERDUE': 0,
    };

    Object.values(grouped).forEach((i) => {
      const { label } = getInspectionStatus(i.date);
      if (statusGroups[label] !== undefined) statusGroups[label]++;
    });

    const chartData = Object.entries(statusGroups).map(([label, value]) => ({ label, value }));
    setSummary(chartData);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Helideck Inspection Dashboard</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">Inspection Status Summary</h2>
        <StatusPieChart data={summary} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map((fac) => {
          const latest = latestByFacility[fac];
          const status = latest ? getInspectionStatus(latest.date) : { label: 'No Records', color: 'bg-gray-300' };
          return (
            <div
              key={fac}
              className="p-4 border rounded shadow bg-white cursor-pointer hover:shadow-md"
              onClick={() => navigate(`/facility/${fac}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{fac}</h3>
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
