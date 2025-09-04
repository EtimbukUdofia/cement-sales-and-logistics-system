import { useState } from 'react';
import {
  SalesInventoryHeader,
  SalesInventoryStatsCards,
  SalesInventorySummaryTable
} from "@/components/inventory/salesPerson";
import { useInventory } from '@/hooks/useInventory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function SalesInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { stats, isLoading, error, refetch, filterInventory } = useInventory();

  // Filter inventory based on search query
  const filteredInventory = filterInventory(searchQuery);

  const handleRefresh = () => {
    refetch();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading inventory: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <SalesInventoryHeader
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />

      {/* Stats Cards */}
      <SalesInventoryStatsCards stats={stats} isLoading={isLoading} />

      {/* Inventory Summary Table */}
      <SalesInventorySummaryTable inventory={filteredInventory} isLoading={isLoading} />
    </div>
  );
}
