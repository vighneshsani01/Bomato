'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader as Loader2 } from 'lucide-react';
import { supabase, MenuItem } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
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

export default function PaymentPage() {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

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

  const handleMakePayment = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !deliveryAddress.trim()) {
      alert('Please fill in all delivery details');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      sessionStorage.removeItem('pendingOrder');
      window.location.href = '/order-confirmation';
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-300"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No order found</h2>
          <p className="text-gray-600 mb-6">Please start by selecting items from a restaurant</p>
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
          <Link href="/order-summary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-b">
                <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              </div>

              <div className="divide-y p-6 max-h-64 overflow-y-auto">
                {order.items.map((orderItem, index) => {
                  const item = getItemDetails(orderItem.itemId);
                  if (!item) return null;
                  const itemTotal = item.price * orderItem.quantity;

                  return (
                    <div key={index} className="flex justify-between items-center pb-4 mb-4 last:pb-0 last:mb-0">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">x{orderItem.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t p-6 space-y-3 bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-2xl text-orange-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-b">
                <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-orange-500 focus:outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-orange-500 focus:outline-none"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    placeholder="Enter your complete delivery address"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    rows={4}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-b">
                <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
              </div>

              <div className="p-6 space-y-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors" style={{ borderColor: paymentMethod === 'upi' ? '#ea580c' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="ml-3 font-semibold text-gray-900">UPI</span>
                  <span className="ml-2 text-sm text-gray-600">(Google Pay, PhonePe, Paytm)</span>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors" style={{ borderColor: paymentMethod === 'card' ? '#ea580c' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="ml-3 font-semibold text-gray-900">Credit/Debit Card</span>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors" style={{ borderColor: paymentMethod === 'cod' ? '#ea580c' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="ml-3 font-semibold text-gray-900">Cash on Delivery</span>
                  <span className="ml-2 text-sm text-gray-600">(Pay when food arrives)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-b">
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-orange-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleMakePayment}
                    disabled={processing}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                    {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {paymentMethod === 'cod'
                      ? 'You will pay when food arrives'
                      : 'Secure payment gateway'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
