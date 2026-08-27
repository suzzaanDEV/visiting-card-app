import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../services/apiService';
import MaintenancePage from '../../pages/MaintenancePage';

const POLL_MS = 60000;

const MaintenanceGuard = ({ children }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    let intervalId;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/settings/public`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setMaintenance(Boolean(data?.maintenanceMode));
          setChecked(true);
        }
      } catch { /* backend offline — don't flip to maintenance */ }
    };

    check();
    intervalId = setInterval(check, POLL_MS);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const isAdminArea = pathname.startsWith('/admin');

  if (maintenance && !isAdminArea && checked) {
    return <MaintenancePage />;
  }

  return children;
};

export default MaintenanceGuard;