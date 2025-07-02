
interface ProductSalesData {
  product_id: string;
  name: string;
  quantity_sold: number;
  revenue: number;
  current_stock: number;
  minimum_stock: number;
  date: string;
}

interface CategorySalesData {
  category_id: string;
  name: string;
  total_sales: number;
  total_items: number;
  date: string;
}

interface SalesData {
  date: string;
  total_sales: number;
  total_items: number;
  total_transactions: number;
}

interface Recommendation {
  type: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  icon: string;
}

export class RecommendationEngine {
  // Simple moving average for trend analysis
  private calculateMovingAverage(data: number[], window: number = 3): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(data[i]);
      } else {
        const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / window);
      }
    }
    return result;
  }

  // Calculate trend direction (1 for up, -1 for down, 0 for stable)
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 1; // Growing
    if (change < -0.1) return -1; // Declining
    return 0; // Stable
  }

  // Predict stock depletion days using linear regression
  private predictStockDepletion(
    currentStock: number,
    dailySales: number[],
    minimumStock: number
  ): number {
    if (dailySales.length === 0 || currentStock <= minimumStock) return 0;
    
    const avgDailySales = dailySales.reduce((a, b) => a + b, 0) / dailySales.length;
    if (avgDailySales <= 0) return Infinity;
    
    const stockToDeplete = currentStock - minimumStock;
    return Math.ceil(stockToDeplete / avgDailySales);
  }

  // Generate stock recommendations
  generateStockRecommendations(productData: ProductSalesData[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Group by product
    const productMap = new Map<string, ProductSalesData[]>();
    productData.forEach(item => {
      if (!productMap.has(item.product_id)) {
        productMap.set(item.product_id, []);
      }
      productMap.get(item.product_id)!.push(item);
    });

    productMap.forEach((sales, productId) => {
      if (sales.length === 0) return;
      
      const product = sales[0];
      const dailySales = sales.map(s => s.quantity_sold);
      const daysUntilDepletion = this.predictStockDepletion(
        product.current_stock,
        dailySales,
        product.minimum_stock
      );

      if (daysUntilDepletion <= 3 && daysUntilDepletion > 0) {
        recommendations.push({
          type: 'Stock Prediction',
          message: `${product.name} will run out in ${daysUntilDepletion} days based on current sales trend`,
          priority: 'High',
          icon: 'Package'
        });
      }

      // Check for low stock
      if (product.current_stock <= product.minimum_stock) {
        recommendations.push({
          type: 'Stock Alert',
          message: `${product.name} is at critical stock level - immediate restocking needed`,
          priority: 'High',
          icon: 'AlertTriangle'
        });
      }
    });

    return recommendations;
  }

  // Generate sales trend recommendations
  generateSalesTrendRecommendations(salesData: SalesData[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (salesData.length < 7) return recommendations;

    const dailySales = salesData.map(s => s.total_sales);
    const dailyItems = salesData.map(s => s.total_items);
    
    const salesTrend = this.calculateTrend(dailySales);
    const itemsTrend = this.calculateTrend(dailyItems);

    // Weekend sales prediction
    const weekendData = salesData.filter((_, index) => {
      const date = new Date(salesData[index].date);
      return date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
    });

    if (weekendData.length > 0) {
      const avgWeekendSales = weekendData.reduce((sum, day) => sum + day.total_sales, 0) / weekendData.length;
      const avgWeekdaySales = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length;
      
      if (avgWeekendSales > avgWeekdaySales * 1.15) {
        recommendations.push({
          type: 'Sales Forecast',
          message: `Weekend sales expected to increase by ${Math.round(((avgWeekendSales / avgWeekdaySales) - 1) * 100)}% - prepare extra inventory`,
          priority: 'Medium',
          icon: 'TrendingUp'
        });
      }
    }

    // Sales trend analysis
    if (salesTrend === 1) {
      recommendations.push({
        type: 'Growth Opportunity',
        message: 'Sales are trending upward - consider expanding popular product lines',
        priority: 'Medium',
        icon: 'TrendingUp'
      });
    } else if (salesTrend === -1) {
      recommendations.push({
        type: 'Sales Alert',
        message: 'Sales are declining - review pricing and marketing strategies',
        priority: 'Medium',
        icon: 'TrendingDown'
      });
    }

    return recommendations;
  }

  // Generate category-based recommendations
  generateCategoryRecommendations(categoryData: CategorySalesData[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Group by category
    const categoryMap = new Map<string, CategorySalesData[]>();
    categoryData.forEach(item => {
      if (!categoryMap.has(item.category_id)) {
        categoryMap.set(item.category_id, []);
      }
      categoryMap.get(item.category_id)!.push(item);
    });

    // Find top performing categories
    const categoryPerformance = Array.from(categoryMap.entries()).map(([categoryId, sales]) => {
      const totalSales = sales.reduce((sum, s) => sum + s.total_sales, 0);
      const totalItems = sales.reduce((sum, s) => sum + s.total_items, 0);
      const categoryName = sales[0]?.name || 'Unknown';
      
      return {
        categoryId,
        categoryName,
        totalSales,
        totalItems,
        avgSalesPerItem: totalItems > 0 ? totalSales / totalItems : 0
      };
    }).sort((a, b) => b.totalSales - a.totalSales);

    if (categoryPerformance.length > 1) {
      const topCategory = categoryPerformance[0];
      recommendations.push({
        type: 'Category Insight',
        message: `${topCategory.categoryName} is your top performing category - consider expanding this product line`,
        priority: 'Low',
        icon: 'Target'
      });
    }

    return recommendations;
  }

  // Main function to generate all recommendations
  generateRecommendations(
    productData: ProductSalesData[],
    salesData: SalesData[],
    categoryData: CategorySalesData[]
  ): Recommendation[] {
    const stockRecommendations = this.generateStockRecommendations(productData);
    const salesRecommendations = this.generateSalesTrendRecommendations(salesData);
    const categoryRecommendations = this.generateCategoryRecommendations(categoryData);

    // Combine and sort by priority
    const allRecommendations = [
      ...stockRecommendations,
      ...salesRecommendations,
      ...categoryRecommendations
    ];

    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return allRecommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 6); // Limit to top 6 recommendations
  }
}
