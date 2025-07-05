import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle, Clock, X, Eye, Receipt, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerWithUtang {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  credit_limit: number;
  total_utang: number;
  last_transaction: string | null;
}

interface CreditTransaction {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  notes?: string | null;
  type?: string | null;
  items?: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
}

type RiskLevel = 'Low' | 'Medium' | 'High';

function getDaysSinceTransaction(lastTransaction: string | null) {
  if (!lastTransaction) return 0;
  const last = new Date(lastTransaction);
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function getRiskLevel(customer: CustomerWithUtang): RiskLevel {
  const days = getDaysSinceTransaction(customer.last_transaction);
  if (days > 14 || customer.total_utang > 1000) return 'High';
  if (days > 7 || customer.total_utang > 500) return 'Medium';
  return 'Low';
}

function getRiskColor(risk: RiskLevel) {
  switch (risk) {
    case 'Low': return 'default';
    case 'Medium': return 'secondary';
    case 'High': return 'destructive';
    default: return 'default';
  }
}

function getRiskIcon(risk: RiskLevel) {
  switch (risk) {
    case 'Low': return <CheckCircle className="w-4 h-4" />;
    case 'Medium': return <Clock className="w-4 h-4" />;
    case 'High': return <AlertCircle className="w-4 h-4" />;
    default: return null;
  }
}

const UtangManagement = () => {
  const [customers, setCustomers] = useState<CustomerWithUtang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'All'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithUtang | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<CreditTransaction[]>([]);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Track which customer is being edited
  const [editingCreditLimitId, setEditingCreditLimitId] = useState<string | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState<number | ''>('');

  const { toast } = useToast();

  // Fetch customers from DB
  const fetchCustomers = async () => {
    const { data, error } = await (supabase.rpc as any)("get_utang_customers");
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer data.",
        variant: "destructive",
      });
      return;
    }
    setCustomers(data || []);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Start editing credit limit
  const handleStartEditingCreditLimit = (customer: CustomerWithUtang) => {
    setEditingCreditLimitId(customer.id);
    setCreditLimitInput(customer.credit_limit);
  };

  // Save credit limit
  const handleSaveCreditLimit = async (customer: CustomerWithUtang) => {
    if (creditLimitInput === "") return;
    const newLimit = Number(creditLimitInput);
    if (newLimit < 0) {
      toast({
        title: "Invalid Credit Limit",
        description: "Credit limit cannot be negative.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase
      .from("customers")
      .update({ credit_limit: newLimit })
      .eq("id", customer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update credit limit",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Credit Limit Updated",
      description: `Credit limit for ${customer.name} is now ₱${newLimit.toLocaleString()}`,
    });
    setEditingCreditLimitId(null);
    setCreditLimitInput("");
    fetchCustomers();
  };

  // Cancel editing
  const handleCancelEditing = () => {
    setEditingCreditLimitId(null);
    setCreditLimitInput("");
  };

  // Mark as paid logic
  const recordPayment = async (customer: CustomerWithUtang) => {
    setIsMarkingPaid(true);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('credits')
      .update({
        status: 'paid',
        paid_date: now,
        updated_at: now,
      })
      .eq('customer_id', customer.id)
      .in('status', ['pending', 'overdue']);

    if (updateError) {
      toast({
        title: 'Payment Update Failed',
        description: updateError.message,
        variant: 'destructive',
      });
      setIsMarkingPaid(false);
      return;
    }

    toast({
      title: 'Payment Recorded',
      description: `Marked all pending/overdue credits as paid for ${customer.name}.`,
    });
    setIsMarkingPaid(false);
    fetchCustomers();
  };

  // Fetch transactions for a specific customer
  const handleViewDetails = async (customer: CustomerWithUtang) => {
    setSelectedCustomer(customer);
    try {
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('customer_id', customer.id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch transactions.",
          variant: "destructive",
        });
        setCustomerTransactions([]);
      } else {
        setCustomerTransactions(data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setCustomerTransactions([]);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    const matchesName = customer.name.toLowerCase().includes(search);
    const matchesPhone = customer.phone ? customer.phone.toLowerCase().includes(search) : false;
    const risk = getRiskLevel(customer);
    const matchesRisk = selectedRisk === 'All' || risk === selectedRisk;
    return (matchesName || matchesPhone) && matchesRisk;
  });

  // Stats
  const totalUtang = customers.reduce((sum, c) => sum + c.total_utang, 0);
  const highRiskCount = customers.filter(c => getRiskLevel(c) === 'High').length;
  const overdueCount = customers.filter(c => getDaysSinceTransaction(c.last_transaction) > 14).length;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Utang Management</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select
          className="border rounded px-2 py-1"
          value={selectedRisk}
          onChange={e => setSelectedRisk(e.target.value as RiskLevel | 'All')}
        >
          <option value="All">All Risks</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <div className="ml-auto flex gap-4">
          <span>Total Utang: <b>₱{totalUtang.toLocaleString()}</b></span>
          <span>High Risk: <b>{highRiskCount}</b></span>
          <span>Overdue: <b>{overdueCount}</b></span>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const daysSince = getDaysSinceTransaction(customer.last_transaction);
          const risk = getRiskLevel(customer);
          const isEditingThisCard = editingCreditLimitId === customer.id;

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
                  <Badge variant={getRiskColor(risk) as any} className="flex items-center space-x-1">
                    {getRiskIcon(risk)}
                    <span>{risk}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Utang</p>
                    <p className="text-lg font-bold text-red-600">
                      ₱{customer.total_utang.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Transaction</p>
                    <p className="text-sm font-medium">{daysSince} days ago</p>
                  </div>
                </div>

                {/* Inline credit limit editor */}
                <div>
                  <p className="text-sm text-gray-600">Credit Limit</p>
                  {!isEditingThisCard ? (
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        ₱{customer.credit_limit.toLocaleString()}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => handleStartEditingCreditLimit(customer)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={creditLimitInput}
                        onChange={e => setCreditLimitInput(Number(e.target.value))}
                        className="max-w-[120px]"
                      />
                      <Button size="sm" variant="outline" onClick={() => handleSaveCreditLimit(customer)}>
                        Save
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleCancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {customer.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm">{customer.address}</p>
                  </div>
                )}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(customer)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => recordPayment(customer)}
                    disabled={isMarkingPaid}
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
        <Card className="border-red-200 bg-red-50 mt-4">
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
              {customers
                .filter(c => getRiskLevel(c) === 'High')
                .map((cust) => (
                  <div key={cust.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                    <div>
                      <p className="font-medium">{cust.name}</p>
                      <p className="text-sm text-gray-600">
                        ₱{cust.total_utang.toLocaleString()} • {getDaysSinceTransaction(cust.last_transaction)} days overdue
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Contact</Button>
                  </div>
                ))
              }
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
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerTransactions([]);
              }}
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
              <Badge
                variant={getRiskColor(getRiskLevel(selectedCustomer)) as any}
                className="ml-auto flex items-center space-x-1"
              >
                {getRiskIcon(getRiskLevel(selectedCustomer))}
                <span>{getRiskLevel(selectedCustomer)}</span>
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Total Utang</p>
                <p className="text-lg font-bold text-red-600">
                  ₱{selectedCustomer.total_utang.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Transaction</p>
                <p className="text-sm">
                  {getDaysSinceTransaction(selectedCustomer.last_transaction)} days ago
                </p>
              </div>
            </div>
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
                    {customerTransactions.map(tx => (
                      <tr key={tx.id} className="border-b">
                        <td className="p-2">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-2">₱{tx.amount?.toLocaleString()}</td>
                        <td className="p-2 capitalize">{tx.type || 'goods'}</td>
                        <td className="p-2 capitalize">{tx.status}</td>
                        <td className="p-2">
                          {tx.items
                            ? tx.items
                                .map(item => `${item.name} x${item.quantity}`)
                                .join(', ')
                            : '-'}
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