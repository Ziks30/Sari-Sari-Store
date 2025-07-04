import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
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

type RiskLevel = 'Low' | 'Medium' | 'High';

function getRiskLevel(customer: CustomerWithUtang): RiskLevel {
  // Simple example: high risk if over 14 days since last transaction or utang > 1000
  if (!customer.last_transaction) return 'Low';
  const days = getDaysSinceTransaction(customer.last_transaction);
  if (days > 14 || customer.total_utang > 1000) return 'High';
  if (days > 7 || customer.total_utang > 500) return 'Medium';
  return 'Low';
}

function getDaysSinceTransaction(lastTransaction: string | null) {
  if (!lastTransaction) return 0;
  const last = new Date(lastTransaction);
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
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
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithUtang | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState<number | ''>('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithUtang | null>(null);
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

  // Edit credit limit
  const openEditCreditLimit = (customer: CustomerWithUtang) => {
    setEditingCustomer(customer);
    setCreditLimitInput(customer.credit_limit);
  };

  const handleEditCreditLimitSave = async () => {
    if (!editingCustomer || creditLimitInput === "") return;
    const { error } = await supabase
      .from("customers")
      .update({ credit_limit: creditLimitInput })
      .eq("id", editingCustomer.id);
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
      description: `Credit limit for ${editingCustomer.name} is now ₱${Number(creditLimitInput).toLocaleString()}`,
    });
    setEditingCustomer(null);
    setCreditLimitInput("");
    fetchCustomers();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 && (
          <div className="text-gray-500">No customers found.</div>
        )}
        {filteredCustomers.map((customer) => {
          const risk = getRiskLevel(customer);
          return (
            <Card key={customer.id} className="cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{customer.name}</CardTitle>
                  <Badge variant={getRiskColor(risk)} className="flex items-center gap-1">
                    {getRiskIcon(risk)}
                    <span>{risk}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-1">Phone: <span className="font-medium">{customer.phone || "—"}</span></div>
                <div className="mb-1">Address: <span className="font-medium">{customer.address || "—"}</span></div>
                <div className="mb-1">
                  Credit Limit: <span className="font-medium text-blue-700">₱{customer.credit_limit?.toLocaleString()}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={e => {e.stopPropagation(); openEditCreditLimit(customer);}}
                  >Edit</Button>
                </div>
                <div className="mb-1">
                  Total Utang: <span className="font-medium text-red-600">₱{customer.total_utang?.toLocaleString()}</span>
                </div>
                <div className="mb-1">
                  Last Transaction:{" "}
                  {customer.last_transaction
                    ? `${new Date(customer.last_transaction).toLocaleDateString()} (${getDaysSinceTransaction(customer.last_transaction)} days ago)`
                    : "—"}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Credit Limit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={open => !open && setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credit Limit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>
              Set new credit limit for <span className="font-bold">{editingCustomer?.name}</span>:
            </p>
            <Input
              type="number"
              min={0}
              value={creditLimitInput}
              onChange={e => setCreditLimitInput(Number(e.target.value))}
              placeholder="Enter credit limit"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEditCreditLimitSave}
              disabled={creditLimitInput === "" || Number(creditLimitInput) < 0}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Badge variant={getRiskColor(getRiskLevel(selectedCustomer))} className="ml-auto flex items-center space-x-1">
                {getRiskIcon(getRiskLevel(selectedCustomer))}
                <span>{getRiskLevel(selectedCustomer)}</span>
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Total Utang</p>
                <p className="text-lg font-bold text-red-600">₱{selectedCustomer.total_utang.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Transaction</p>
                <p className="text-sm">
                  {selectedCustomer.last_transaction
                    ? `${getDaysSinceTransaction(selectedCustomer.last_transaction)} days ago`
                    : "—"}
                </p>
              </div>
            </div>
            {/* You can add more details here, like transaction history, once you fetch that info from the DB */}
          </div>
        </div>
      )}
    </div>
  );
};

export default UtangManagement;