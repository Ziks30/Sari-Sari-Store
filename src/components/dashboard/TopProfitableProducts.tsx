import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProductProfit {
  name: string;
  profit: number;
  quantity: number;
  category: string;
}

interface TopProfitableProductsProps {
  products: ProductProfit[];
}

const TopProfitableProducts: React.FC<TopProfitableProductsProps> = ({ products }) => (
  <Card>
    <CardHeader>
      <CardTitle>Most Profitable Products</CardTitle>
    </CardHeader>
    <CardContent>
      <ul>
        {products.slice(0, 5).map((prod, i) => (
          <li key={prod.name} className="flex justify-between mb-2">
            <span>{i+1}. {prod.name} <span className="text-xs text-gray-500">({prod.category})</span></span>
            <span className="font-bold text-green-600">
              ₱{prod.profit.toLocaleString(undefined, {maximumFractionDigits: 2})}
            </span>
          </li>
        ))}
      </ul>
      {products.length === 0 && <div className="text-gray-500 text-center py-6">No sales yet.</div>}
    </CardContent>
  </Card>
);

export default TopProfitableProducts;