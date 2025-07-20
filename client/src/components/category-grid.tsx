import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Category } from "@/types";

export default function CategoryGrid() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories?.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.id}`}
          className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <i className={`fas ${category.icon} text-2xl text-white`}></i>
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors">
            {category.name}
          </h3>
          <p className="font-bengali text-gray-600 text-sm mb-2">
            {category.namebn}
          </p>
          <p className="text-red-600 font-bold">
            থেকে ৳{category.minPrice}
          </p>
        </Link>
      ))}
    </div>
  );
}
