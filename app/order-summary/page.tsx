'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { supabase, MenuItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface OrderItem {
  itemId: string;
  quantity: number;
}

interface PendingOrder {
  restaurantId: string;
  items: OrderItem[];
  restaurantName: string;
  restaurantImage: string;
}

export default function OrderSummaryPage() {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderData = sessionStorage.getItem('pendingOrder');
    if (orderData) {
      const parsedOrder = JSON.parse(orderData);
      setOrder(parsedOrder);
      fetchMenuItems(parsedOrder.restaurantId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemDetails = (itemId: string) => {
    return menuItems.find((item) => item.id === itemId);
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, orderItem) => {
      const item = getItemDetails(orderItem.itemId);
      return sum + (item ? item.price * orderItem.quantity : 0);
    }, 0);
  };

  const deliveryFee = 2.99;
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleProceedToPayment = () => {
    window.location.href = '/payment';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-300"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-12 bg-gray-300 rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your order first</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href={`/restaurant/${order.restaurantId}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order Summary</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="h-48 relative overflow-hidden">
            <img
              src={order.restaurantImage}
              alt={order.restaurantName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {order.restaurantName}
            </h2>
            <p className="text-gray-600 mt-1">Order from your favorite restaurant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900">Order Items</h3>
              </div>

              <div className="divide-y">
                {order.items.map((orderItem, index) => {
                  const item = getItemDetails(orderItem.itemId);
                  if (!item) return null;
                  const itemTotal = item.price * orderItem.quantity;

                  return (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.category}
                          </p>
                        </div>
                        <span className="text-orange-600 font-bold text-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold text-lg text-gray-900">
                            {orderItem.quantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Item Total</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-b">
                <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold text-gray-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Grand Total</span>
                  <span className="font-bold text-2xl text-orange-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Proceed to Payment
                </button>

                <Link href={`/restaurant/${order.restaurantId}`}>
                  <button className="w-full py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
