import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CustomerWithUtang {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  credit_limit: number;
  total_utang: number;
  last_transaction: string | null;
}

const UtangManagement = () => {
  const [customers, setCustomers] = useState<CustomerWithUtang[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithUtang | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState<number | "">("");
  const { toast } = useToast();

  // Fetch customers with utang info
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

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Utang Management</h2>
      <Input
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 max-w-md"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 && (
          <div className="text-gray-500">No customers found.</div>
        )}
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
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
                  onClick={() => openEditCreditLimit(customer)}
                >
                  Edit
                </Button>
              </div>
              <div className="mb-1">
                Total Utang: <span className="font-medium text-red-600">₱{customer.total_utang?.toLocaleString()}</span>
              </div>
              <div className="mb-1">
                Last Transaction:{" "}
                {customer.last_transaction
                  ? new Date(customer.last_transaction).toLocaleDateString()
                  : "—"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Credit Limit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
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
              onChange={(e) => setCreditLimitInput(Number(e.target.value))}
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
    </div>
  );
};

export default UtangManagement;