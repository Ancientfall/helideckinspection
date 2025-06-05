import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../constants/roles';

const DebugAuth = () => {
  const { user, hasPermission } = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-md">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <p><strong>User:</strong> {user?.username || 'Not logged in'}</p>
        <p><strong>Role:</strong> {user?.role || 'No role'}</p>
        <p><strong>Can Manage Facilities:</strong> {hasPermission(PERMISSIONS.MANAGE_FACILITIES) ? 'Yes' : 'No'}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600">Full User Data</summary>
          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default DebugAuth;
EOF < /dev/null