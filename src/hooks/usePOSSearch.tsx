
import { useState } from 'react';

export const usePOSSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filterProducts = (products: any[]) => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || 
        (product.categories && product.categories.name === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filterProducts
  };
};
