'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import { supabase, Restaurant, MenuItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RestaurantPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      const [restaurantResponse, menuResponse] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('category'),
      ]);

      if (restaurantResponse.error) throw restaurantResponse.error;
      if (menuResponse.error) throw menuResponse.error;

      setRestaurant(restaurantResponse.data);
      setMenuItems(menuResponse.data || []);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 0;
      const newQuantity = current + delta;
      const updated = { ...prev };
      if (newQuantity <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = newQuantity;
      }
      return updated;
    });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const totalItems = Object.values(itemQuantities).reduce((sum, qty) => sum + qty, 0);
  const subtotal = Object.entries(itemQuantities).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((i) => i.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleViewOrder = () => {
    if (!restaurant) return;

    const orderData = Object.entries(itemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemId,
        quantity: qty,
      }));

    sessionStorage.setItem(
      'pendingOrder',
      JSON.stringify({
        restaurantId,
        items: orderData,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.image_url,
      })
    );

    window.location.href = '/order-summary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
            <div className="h-6 bg-gray-300 rounded mb-8 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restaurant not found
          </h2>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 max-w-2xl">
                {restaurant.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{restaurant.rating}</span>
            </div>
            <Badge variant="default" className="bg-orange-100 text-orange-700">
              {restaurant.price_level}
            </Badge>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">30-45 mins</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine_tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Menu</h2>

            <div className="space-y-12">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-200">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-orange-600 font-bold text-lg ml-4 whitespace-nowrap">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        {itemQuantities[item.id] ? (
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-700 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-900">
                              {itemQuantities[item.id]}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-10 h-10 rounded-lg bg-orange-600 hover:bg-orange-700 flex items-center justify-center font-semibold text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="mt-4 w-full py-2 px-4 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold rounded-lg transition-colors"
                          >
                            Add to Order
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

              {Object.keys(itemQuantities).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No items selected yet
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {Object.entries(itemQuantities).map(([itemId, quantity]) => {
                      const item = menuItems.find((i) => i.id === itemId);
                      if (!item) return null;
                      return (
                        <div key={itemId} className="flex justify-between items-center pb-3 border-b">
                          <div>
                            <p className="text-gray-900 font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">x{quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            ${(item.price * quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-semibold text-gray-900">$2.99</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-orange-600">
                        ${(subtotal + 2.99).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleViewOrder}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    View Order ({totalItems})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
