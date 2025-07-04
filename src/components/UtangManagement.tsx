import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, CreditCard, AlertCircle, CheckCircle, Clock, Plus, Eye, Receipt, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


export interface UtangTransaction {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  amount: number;
  type: 'goods' | 'cash';
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  date: string;
  dueDate?: string;
 status: 'active' | 'paid' | 'overdue' | 'cancelled'
  notes?: string;
}

interface UtangCustomer {
  id: string;
  name: string;
  totalUtang: number;
  lastTransaction: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  phone?: string;
  address?: string;
  notes?: string;
  transactions: UtangTransaction[];
}

// Mock data - in real app this would come from a database
const mockUtangData: UtangCustomer[] = [
  {
    id: 'b3b1a2e0-1c2d-4e5f-8a7b-9c0d1e2f3a4b', // valid UUID
    name: 'Maria Santos',
    totalUtang: 450,
    lastTransaction: '2024-06-20',
    riskLevel: 'Low',
    phone: '09123456789',
    address: '123 Barangay Street',
    notes: 'Regular customer, always pays on time',
    transactions: [
      {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', // valid UUID
        customerName: 'Maria Santos',
        amount: 450,
        type: 'goods',
        items: [
          { name: 'Coca Cola', quantity: 2, price: 15 },
          { name: 'Lucky Me Pancit Canton', quantity: 5, price: 18 }
        ],
        date: '2024-06-20',
        status: 'active',
        notes: 'Will pay next week'
      }
    ]
  },
  {
    id: 'c4d5e6f7-8a9b-0c1d-2e3f-4a5b6c7d8e9f', // valid UUID
    name: 'Juan dela Cruz',
    totalUtang: 1200,
    lastTransaction: '2024-06-15',
    riskLevel: 'Medium',
    phone: '09187654321',
    address: '456 Sitio Uno',
    notes: 'Sometimes late on payments',
    transactions: [
      {
        id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a', // valid UUID
        customerName: 'Juan dela Cruz',
        amount: 800,
        type: 'goods',
        date: '2024-06-15',
        status: 'active'
      },
      {
        id: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b', // valid UUID
        customerName: 'Juan dela Cruz',
        amount: 400,
        type: 'cash',
        date: '2024-06-10',
        status: 'active',
        notes: 'Emergency cash loan'
      }
    ]
  }
];

// Global utang storage for new transactions
let globalUtangTransactions: UtangTransaction[] = [];

export const addUtangTransaction = (transaction: UtangTransaction) => {
  globalUtangTransactions.push(transaction);
};

const UtangManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<UtangCustomer | null>(null);
  const [utangData, setUtangData] = useState<UtangCustomer[]>(mockUtangData);
  const { toast } = useToast();

  // Check for new utang transactions from POS
  useEffect(() => {
    const checkForNewTransactions = () => {
      if (globalUtangTransactions.length > 0) {
        const newTransactions = [...globalUtangTransactions];
        globalUtangTransactions = []; // Clear the global array
        
        newTransactions.forEach(transaction => {
          setUtangData(prevData => {
            const existingCustomerIndex = prevData.findIndex(
              customer => customer.name.toLowerCase() === transaction.customerName.toLowerCase()
            );
            
            if (existingCustomerIndex >= 0) {
              // Update existing customer
              const updatedData = [...prevData];
              updatedData[existingCustomerIndex] = {
                ...updatedData[existingCustomerIndex],
                totalUtang: updatedData[existingCustomerIndex].totalUtang + transaction.amount,
                lastTransaction: transaction.date,
                transactions: [...updatedData[existingCustomerIndex].transactions, transaction]
              };
              return updatedData;
            } else {
              // Add new customer
              const newCustomer: UtangCustomer = {
                id: `new-${Date.now()}`,
                name: transaction.customerName,
                totalUtang: transaction.amount,
                lastTransaction: transaction.date,
                riskLevel: 'Low',
                phone: transaction.customerPhone,
                address: transaction.customerAddress,
                transactions: [transaction]
              };
              return [...prevData, newCustomer];
            }
          });
        });
        
        toast({
          title: "New Utang Transaction",
          description: `${newTransactions.length} new utang transaction(s) recorded`,
        });
      }
    };

    const interval = setInterval(checkForNewTransactions, 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const riskLevels = ['All', 'Low', 'Medium', 'High'];

  const filteredCustomers = utangData.filter(customer => {
    const search = searchTerm.toLowerCase();
    const matchesName = customer.name.toLowerCase().includes(search);
    const matchesPhone = customer.phone ? customer.phone.toLowerCase().includes(search) : false;
    const matchesRisk = selectedRisk === 'All' || customer.riskLevel === selectedRisk;
    return (matchesName || matchesPhone) && matchesRisk;
  });

  const totalUtang = utangData.reduce((sum, customer) => sum + customer.totalUtang, 0);
  const highRiskCount = utangData.filter(c => c.riskLevel === 'High').length;
  const overdueCount = utangData.filter(c => {
    const lastTransactionDate = new Date(c.lastTransaction);
    const daysSince = Math.floor((Date.now() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 14;
  }).length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'default';
      case 'Medium': return 'secondary';
      case 'High': return 'destructive';
      default: return 'default';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'High': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getDaysSinceTransaction = (lastTransaction: string) => {
    const lastTransactionDate = new Date(lastTransaction);
    const daysSince = Math.floor((Date.now() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince;
  };

  const recordPayment = async (customerId: string, amount: number) => {
  const now = new Date().toISOString();

  // Step 1: Update all "pending" or "overdue" credits to "paid"
  const { error: updateError } = await supabase
    .from('credits')
    .update({
      status: 'paid',
      paid_date: now,
      updated_at: now,
    })
    .eq('customer_id', customerId)
    .in('status', ['pending', 'overdue']);

  if (updateError) {
    toast({
      title: 'Payment Update Failed',
      description: updateError.message,
      variant: 'destructive',
    });
    return;
  }

  // Step 2: Fetch updated credits to reflect changes in UI
  const { data: updatedCredits, error: fetchError } = await supabase
    .from('credits')
    .select('*')
    .eq('customer_id', customerId);

  if (fetchError || !updatedCredits) {
    toast({
      title: 'Fetch Error',
      description: fetchError?.message || 'Unable to retrieve updated credits.',
      variant: 'destructive',
    });
    return;
  }

  // Step 3: Update state with filtered transactions and updated total
  setUtangData(prevData =>
    prevData.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            totalUtang: updatedCredits
              .filter(c => c.status === 'pending' || c.status === 'overdue')
              .reduce((sum, c) => sum + (c.amount || 0), 0),
            transactions: updatedCredits.map(c => ({
              id: c.id,
              customerName: customer.name,
              amount: c.amount,
              type: (c as any).type || 'goods', // if you store `type` in another table, adjust this
              date: c.created_at,
              status: c.status as 'active' | 'paid' | 'overdue' | 'cancelled',
              notes: c.notes || undefined,
            })),
          }
        : customer
    )
  );

  toast({
    title: 'Payment Recorded',
    description: `Marked ₱${amount.toLocaleString()} as paid for this customer.`,
  });
};


  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{utangData.length}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">₱{totalUtang.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Utang Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {riskLevels.map((level) => (
                <Button
                  key={level}
                  variant={selectedRisk === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRisk(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const daysSince = getDaysSinceTransaction(customer.lastTransaction);
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </div>
                  <Badge variant={getRiskColor(customer.riskLevel) as any} className="flex items-center space-x-1">
                    {getRiskIcon(customer.riskLevel)}
                    <span>{customer.riskLevel}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Utang</p>
                    <p className="text-lg font-bold text-red-600">₱{customer.totalUtang.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Transaction</p>
                    <p className="text-sm font-medium">{daysSince} days ago</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-sm font-medium">{customer.transactions.length} transaction(s)</p>
                </div>
                
                {customer.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm">{customer.address}</p>
                  </div>
                )}
                
                {customer.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-sm text-gray-800">{customer.notes}</p>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => recordPayment(customer.id, customer.totalUtang)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Mark Paid
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* High Risk Alert */}
      {highRiskCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>High Risk Customers Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              {highRiskCount} customer{highRiskCount > 1 ? 's' : ''} require immediate attention due to overdue payments.
            </p>
            <div className="space-y-2">
              {utangData.filter(c => c.riskLevel === 'High').map((customer) => (
                <div key={customer.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">₱{customer.totalUtang.toLocaleString()} • {getDaysSinceTransaction(customer.lastTransaction)} days overdue</p>
                  </div>
                  <Button size="sm" variant="outline">Contact</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedCustomer(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                {selectedCustomer.address && (
                  <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                )}
              </div>
              <Badge variant={getRiskColor(selectedCustomer.riskLevel) as any} className="ml-auto flex items-center space-x-1">
                {getRiskIcon(selectedCustomer.riskLevel)}
                <span>{selectedCustomer.riskLevel}</span>
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Total Utang</p>
                <p className="text-lg font-bold text-red-600">₱{selectedCustomer.totalUtang.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Transaction</p>
                <p className="text-sm">{getDaysSinceTransaction(selectedCustomer.lastTransaction)} days ago</p>
              </div>
            </div>
            {selectedCustomer.notes && (
              <div className="mb-2">
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-800">{selectedCustomer.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Transactions</p>
              <div className="max-h-40 overflow-y-auto border rounded">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Items</th>
                      <th className="p-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.transactions.map(tx => (
                      <tr key={tx.id} className="border-b">
                        <td className="p-2">{tx.date}</td>
                        <td className="p-2">₱{tx.amount.toLocaleString()}</td>
                        <td className="p-2 capitalize">{tx.type}</td>
                        <td className="p-2 capitalize">{tx.status}</td>
                        <td className="p-2">
                          {tx.items ? tx.items.map(item => `${item.name} x${item.quantity}`).join(', ') : '-'}
                        </td>
                        <td className="p-2">{tx.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UtangManagement;
