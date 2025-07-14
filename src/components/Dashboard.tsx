import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQueries, useData } from '../hooks/useData';
import { useAllData } from '../hooks/useAllData';
import { useCustomers } from '../hooks/useData';
import Sidebar from './Sidebar';
import MyPerformanceTab from './tabs/MyPerformanceTab';
import CompetitorsTab from './tabs/CompetitorsTab';
import SourcesTab from './tabs/SourcesTab';
import SettingsTab from './tabs/SettingsTab';

const Dashboard: React.FC = () => {
  const { customerName, logout, isAdmin, userProfile } = useAuth();
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('performance');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  
  // For admin users, we need customer selection
  const { customers, loading: customersLoading } = useCustomers();
  
  // Set initial customer selection for admin users
  React.useEffect(() => {
    if (isAdmin && customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [isAdmin, customers, selectedCustomer]);
  
  // Determine which customer to use for data queries
  const effectiveCustomer = isAdmin ? selectedCustomer : customerName;
  
  const { queries, loading: queriesLoading } = useQueries(effectiveCustomer);
  const { data, loading: dataLoading } = useData(effectiveCustomer, selectedQuery);
  const { allData, loading: allDataLoading } = useAllData(effectiveCustomer);

  const handleQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuery(e.target.value);
  };

  if (queriesLoading || (isAdmin && customersLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAdmin && !selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Customers Available</h2>
          <p className="text-gray-600">No customers found in the system.</p>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!queries.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Queries Found</h2>
          <p className="text-gray-600">No queries found for customer: {effectiveCustomer}</p>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-500">{isAdmin ? 'Admin Dashboard' : 'Welcome back,'}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isAdmin ? userProfile?.email : customerName}
                </h2>
              </div>
              
              {isAdmin && (
                <div className="flex items-center space-x-4">
                  <label htmlFor="customer" className="text-sm font-medium text-gray-700">
                    Customer:
                  </label>
                  <select
                    id="customer"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="min-w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {customers.map((customer) => (
                      <option key={customer} value={customer}>
                        {customer}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <label htmlFor="query" className="text-sm font-medium text-gray-700">
                  Query:
                </label>
                <select
                  id="query"
                  value={selectedQuery}
                  onChange={handleQueryChange}
                  className="min-w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Select a query --</option>
                  {queries.map((query) => (
                    <option key={query} value={query}>
                      {query}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 py-6 overflow-auto">
          {activeTab === 'settings' ? (
            <SettingsTab />
          ) : !selectedQuery ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Query to Get Started
              </h3>
              <p className="text-gray-600">
                Choose a query from the dropdown above to view detailed analytics and insights.
              </p>
            </div>
          ) : dataLoading || allDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-lg text-gray-600">Loading data...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                No data found for the selected customer and query.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'performance' && <MyPerformanceTab data={data} selectedQuery={selectedQuery} />}
              {activeTab === 'competitors' && <CompetitorsTab data={data} allData={allData} selectedQuery={selectedQuery} />}
              {activeTab === 'sources' && <SourcesTab data={data} allData={allData} selectedQuery={selectedQuery} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;