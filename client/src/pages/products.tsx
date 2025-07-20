import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid, List, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ProductCard from "@/components/product-card";
import type { Product } from "@shared/schema";
import type { Category } from "@/types";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const setSearchParams = (params: URLSearchParams) => {
    const newUrl = `/products?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Parse URL parameters manually
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "";
  const search = urlParams.get("search") || "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products with filters
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { 
      search: searchQuery, 
      category: selectedCategory,
      sortBy 
    }],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && product.tags) {
        const hasTag = selectedTags.some(tag => product.tags?.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return filtered;
  }, [products, priceRange, selectedTags, sortBy]);

  // Get unique tags from products
  const availableTags = useMemo(() => {
    if (!products) return [];
    const tags = new Set<string>();
    products.forEach(product => {
      product.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [products]);

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    window.history.pushState({}, '', `${window.location.pathname}?${newParams}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams('search', searchQuery);
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  };

  const formatPrice = (price: number) => `৳${price}`;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!selectedCategory}
              onCheckedChange={() => {
                updateSearchParams('category', '');
                setSelectedCategory("")
              }}
            />
            <label htmlFor="all-categories" className="text-sm">All Categories</label>
          </div>
          {categories?.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategory === category.id}
                onCheckedChange={() => {
                  updateSearchParams('category', selectedCategory === category.id ? "" : category.id);
                  setSelectedCategory(selectedCategory === category.id ? "" : category.id)
                }}
              />
              <label htmlFor={category.id} className="text-sm">{category.namebn}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="space-y-2">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTags([...selectedTags, tag]);
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    }
                  }}
                />
                <label htmlFor={tag} className="text-sm capitalize">{tag}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          updateSearchParams('category', '');
          updateSearchParams('search', '');
          setSelectedCategory("");
          setPriceRange([0, 500000]);
          setSelectedTags([]);
          setSearchQuery("");
        }}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
        <p className="text-gray-600 font-bengali">সকল পণ্যসমূহ</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="পণ্য খুঁজুন... Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </form>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center space-x-2 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="p-2"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedTags.length > 0 || searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Search: {searchQuery}</span>
                <button onClick={() => {
                  updateSearchParams('search', '');
                  setSearchQuery("")
                }} className="ml-1 hover:text-red-600">×</button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Category: {categories?.find(c => c.id === selectedCategory)?.namebn}</span>
                <button onClick={() => {
                  updateSearchParams('category', '');
                  setSelectedCategory("")
                }} className="ml-1 hover:text-red-600">×</button>
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} className="ml-1 hover:text-red-600">×</button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
            <FilterContent />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products?.length || 0} products
            </p>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 font-bengali">কোন পণ্য পাওয়া যায়নি</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedTags([]);
                  setPriceRange([0, 500000]);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  className={viewMode === "list" ? "flex-row" : ""}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 rounded-full font-bold btn-hover"
              >
                Load More Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}