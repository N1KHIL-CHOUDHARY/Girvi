import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/DarkModeToggle';



export default function Dashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme(); 
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        setDashboardData(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div>Could not load dashboard data.</div>;
  }

  // Destructure all data from the API
  
   return(<>
       <div>
         Hello 
       </div>
   </>);
}