
import { supabase } from '@/integrations/supabase/client';

interface SampleProduct {
  name: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  category_name: string;
}

const sampleProducts: SampleProduct[] = [
  // Beverages
  { name: 'Coca-Cola 350ml', unit_price: 25, cost_price: 20, current_stock: 50, minimum_stock: 10, maximum_stock: 100, category_name: 'Beverages' },
  { name: 'Sprite 350ml', unit_price: 25, cost_price: 20, current_stock: 45, minimum_stock: 10, maximum_stock: 100, category_name: 'Beverages' },
  { name: 'Royal 350ml', unit_price: 22, cost_price: 18, current_stock: 30, minimum_stock: 8, maximum_stock: 80, category_name: 'Beverages' },
  { name: 'Mineral Water 500ml', unit_price: 15, cost_price: 12, current_stock: 80, minimum_stock: 20, maximum_stock: 150, category_name: 'Beverages' },
  
  // Snacks
  { name: 'Chicharon ni Mang Juan', unit_price: 12, cost_price: 9, current_stock: 25, minimum_stock: 5, maximum_stock: 50, category_name: 'Snacks' },
  { name: 'Nova Multigrain', unit_price: 8, cost_price: 6, current_stock: 40, minimum_stock: 10, maximum_stock: 80, category_name: 'Snacks' },
  { name: 'Piattos Cheese', unit_price: 35, cost_price: 28, current_stock: 20, minimum_stock: 5, maximum_stock: 40, category_name: 'Snacks' },
  
  // Instant Noodles
  { name: 'Lucky Me Pancit Canton', unit_price: 18, cost_price: 15, current_stock: 60, minimum_stock: 15, maximum_stock: 120, category_name: 'Instant Noodles' },
  { name: 'Nissin Cup Noodles', unit_price: 22, cost_price: 18, current_stock: 35, minimum_stock: 8, maximum_stock: 70, category_name: 'Instant Noodles' },
  
  // Personal Care
  { name: 'Safeguard Soap 90g', unit_price: 28, cost_price: 22, current_stock: 15, minimum_stock: 5, maximum_stock: 30, category_name: 'Personal Care' },
  { name: 'Colgate Toothpaste 25g', unit_price: 15, cost_price: 12, current_stock: 25, minimum_stock: 8, maximum_stock: 50, category_name: 'Personal Care' },
  
  // Household
  { name: 'Tide Powder 35g', unit_price: 8, cost_price: 6, current_stock: 50, minimum_stock: 15, maximum_stock: 100, category_name: 'Household' },
  { name: 'Joy Dishwashing Liquid 250ml', unit_price: 45, cost_price: 35, current_stock: 12, minimum_stock: 3, maximum_stock: 25, category_name: 'Household' },
];

const sampleCustomers = [
  { name: 'Maria Santos', phone: '09123456789', address: 'Brgy. San Jose', credit_limit: 500 },
  { name: 'Juan Dela Cruz', phone: '09234567890', address: 'Brgy. Poblacion', credit_limit: 1000 },
  { name: 'Ana Reyes', phone: '09345678901', address: 'Brgy. Riverside', credit_limit: 750 },
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // First, create categories
    const categories = [...new Set(sampleProducts.map(p => p.category_name))];
    const categoryData = categories.map(name => ({ name }));
    
    const { data: insertedCategories, error: categoryError } = await supabase
      .from('categories')
      .upsert(categoryData, { onConflict: 'name' })
      .select();

    if (categoryError) throw categoryError;
    console.log('Categories created:', insertedCategories.length);

    // Create products with category references
    const productsWithCategories = sampleProducts.map(product => {
      const category = insertedCategories.find(c => c.name === product.category_name);
      return {
        name: product.name,
        unit_price: product.unit_price,
        cost_price: product.cost_price,
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        maximum_stock: product.maximum_stock,
        category_id: category?.id,
      };
    });

    const { data: insertedProducts, error: productError } = await supabase
      .from('products')
      .upsert(productsWithCategories, { onConflict: 'name' })
      .select();

    if (productError) throw productError;
    console.log('Products created:', insertedProducts.length);

    // Create customers
    const { data: insertedCustomers, error: customerError } = await supabase
      .from('customers')
      .upsert(sampleCustomers, { onConflict: 'name' })
      .select();

    if (customerError) throw customerError;
    console.log('Customers created:', insertedCustomers.length);

    // Create sample sales transactions for the last 30 days
    const salesData = [];
    const saleItemsData = [];
    
    // Get current user ID (assuming authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const cashierId = user?.id || 'default-cashier-id';

    for (let day = 29; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Generate 3-8 sales per day
      const salesPerDay = Math.floor(Math.random() * 6) + 3;
      
      for (let sale = 0; sale < salesPerDay; sale++) {
        const saleId = crypto.randomUUID();
        const isCredit = Math.random() < 0.3; // 30% chance of credit sale
        const customer = isCredit ? insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)] : null;
        
        // Generate 1-4 items per sale
        const itemsPerSale = Math.floor(Math.random() * 4) + 1;
        let totalAmount = 0;
        
        for (let item = 0; item < itemsPerSale; item++) {
          const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = product.unit_price;
          const totalPrice = quantity * unitPrice;
          
          saleItemsData.push({
            id: crypto.randomUUID(),
            sale_id: saleId,
            product_id: product.id,
            quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
          });
          
          totalAmount += totalPrice;
        }
        
        const creditAmount = isCredit ? totalAmount * (0.5 + Math.random() * 0.5) : 0; // 50-100% on credit
        const amountPaid = totalAmount - creditAmount;
        
        salesData.push({
          id: saleId,
          cashier_id: cashierId,
          customer_id: customer?.id || null,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          credit_amount: creditAmount,
          change_amount: 0,
          transaction_type: 'sale',
          created_at: date.toISOString(),
        });
      }
    }

    // Insert sales
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesData);

    if (salesError) throw salesError;
    console.log('Sales created:', salesData.length);

    // Insert sale items
    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData);

    if (saleItemsError) throw saleItemsError;
    console.log('Sale items created:', saleItemsData.length);

    // Create credits for credit sales
    const creditSales = salesData.filter(sale => sale.credit_amount > 0);
    const creditsData = creditSales.map(sale => ({
      customer_id: sale.customer_id!,
      sale_id: sale.id,
      amount: sale.credit_amount,
      status: 'pending' as const,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    }));

    if (creditsData.length > 0) {
      const { error: creditsError } = await supabase
        .from('credits')
        .insert(creditsData);

      if (creditsError) throw creditsError;
      console.log('Credits created:', creditsData.length);
    }

    console.log('Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully!' };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};
