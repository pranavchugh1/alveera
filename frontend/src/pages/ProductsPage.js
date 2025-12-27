import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Filter, X, Loader2, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default pagination settings
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

// Debounce hook for search optimization
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Search state with debounce
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    material: '',
    color: '',
    minPrice: '',
    maxPrice: '',
  });

  // Track if this is the initial load or filter/search change
  const isFilterChange = useRef(false);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNum, shouldAppend = false) => {
    if (shouldAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = {
        page: pageNum,
        limit: DEFAULT_LIMIT
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.material) params.material = filters.material;
      if (filters.color) params.color = filters.color;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await axios.get(`${API}/products`, { params });
      const data = response.data;
      
      // Update products - append or replace based on shouldAppend
      if (shouldAppend) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }
      
      // Update pagination metadata
      setTotalProducts(data.total_products);
      setTotalPages(data.total_pages);
      setHasMore(data.has_more);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, debouncedSearch]);

  // Effect for initial load and filter/search changes
  useEffect(() => {
    // Reset to page 1 when filters or search changes
    setPage(DEFAULT_PAGE);
    fetchProducts(DEFAULT_PAGE, false);
  }, [filters, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle "Load More" button click
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchProducts(page + 1, true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'category') {
      if (value) {
        searchParams.set('category', value);
      } else {
        searchParams.delete('category');
      }
      setSearchParams(searchParams);
    }
  };

  // Handle search input change (updates immediately for UI, debounced for API)
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      material: '',
      color: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white" data-testid="products-page">
      <div className="bg-[#F9F5F0] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl mb-4" data-testid="page-title">Shop Collection</h1>
          <p className="text-gray-600">Discover timeless elegance in every piece</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 btn-secondary mb-4"
            data-testid="mobile-filter-toggle"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters Sidebar */}
          <aside
            className={`lg:block lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden'
              }`}
            data-testid="filters-sidebar"
          >
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl" data-testid="filters-title">Filters</h2>
                {(filters.category || filters.material || filters.color || filters.minPrice || filters.maxPrice || searchInput) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#C5A059] hover:underline"
                    data-testid="clear-filters-button"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search Input with Debounce */}
                <div data-testid="filter-search">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent"
                      data-testid="search-input"
                    />
                  </div>
                  {searchInput && searchInput !== debouncedSearch && (
                    <p className="text-xs text-gray-400 mt-1">Searching...</p>
                  )}
                </div>

                {/* Category Filter */}
                <div data-testid="filter-category">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Category</h3>
                  <div className="space-y-2">
                    {['new-arrivals', 'festive', 'silk'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer" data-testid={`category-${cat}`}>
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat}
                          onChange={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                          className="accent-[#C5A059]"
                        />
                        <span className="text-sm capitalize">{cat.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material Filter */}
                <div data-testid="filter-material">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Material</h3>
                  <div className="space-y-2">
                    {['Georgette', 'Chiffon', 'Silk', 'Silk Blend'].map(mat => (
                      <label key={mat} className="flex items-center gap-2 cursor-pointer" data-testid={`material-${mat}`}>
                        <input
                          type="radio"
                          name="material"
                          checked={filters.material === mat}
                          onChange={() => handleFilterChange('material', filters.material === mat ? '' : mat)}
                          className="accent-[#C5A059]"
                        />
                        <span className="text-sm">{mat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div data-testid="filter-color">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Color</h3>
                  <div className="space-y-2">
                    {['Navy Blue', 'Orange', 'Pink', 'Red', 'Green', 'Yellow', 'Purple'].map(color => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer" data-testid={`color-${color}`}>
                        <input
                          type="radio"
                          name="color"
                          checked={filters.color === color}
                          onChange={() => handleFilterChange('color', filters.color === color ? '' : color)}
                          className="accent-[#C5A059]"
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div data-testid="filter-price">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent"
                      data-testid="min-price-input"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent"
                      data-testid="max-price-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between" data-testid="products-header">
              <p className="text-gray-600" data-testid="products-count">
                Showing {products.length} of {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20" data-testid="loading-state">
                <div className="inline-block w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20" data-testid="no-products">
                <p className="text-gray-600 text-lg">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      data-testid={`product-card-${index}`}
                    >
                      <Link to={`/products/${product.id}`} className="group block">
                        <div className="bg-white p-4 transition-all duration-300 border border-transparent hover:border-[#C5A059]/30">
                          <div className="aspect-[3/4] mb-4 overflow-hidden">
                            <img
                              src={product.images?.[0] || product.image_url}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{product.design_no}</p>
                          <h3 className="font-serif text-lg mb-2 group-hover:text-[#C5A059] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-[#C5A059] font-bold">₹{product.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{product.material}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12" data-testid="load-more-container">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#C5A059] text-white font-medium hover:bg-[#B08F4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="load-more-button"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More (Page ${page + 1} of ${totalPages})`
                      )}
                    </button>
                  </div>
                )}

                {/* All products loaded message */}
                {!hasMore && products.length > 0 && totalProducts > DEFAULT_LIMIT && (
                  <div className="text-center mt-8" data-testid="all-loaded">
                    <p className="text-gray-500 text-sm">All {totalProducts} products loaded</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}