import { useState } from 'react';
import AdminSidebar from '../AdminSidebar';

export default function AdminSidebarExample() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />;
}
