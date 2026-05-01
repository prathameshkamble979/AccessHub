import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { getActiveUser } from "../controllers/api.client"; ❌ COMMENTED

import { auth } from '../config/firebase';
import { useEffect, useState } from 'react';

export function PrivateRoute() {
  // const activeUser = getActiveUser();

  //  FIREBASE STATE
  const [activeUser, setActiveUser] = useState<any>(undefined);

  const location = useLocation();

  //  FIREBASE LISTENER
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setActiveUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  if (activeUser === undefined) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        Loading session...
      </div>
    );
  }

  if (!activeUser) {
    return (
      <Navigate
        to='/login'
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
