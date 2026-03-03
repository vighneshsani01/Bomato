'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleCheck as CheckCircle, MapPin, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const [orderNumber] = useState(
    `BOM${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 text-center border-b">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Your delicious meal is being prepared
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-600">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-3xl font-bold text-gray-900 font-mono">
                {orderNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-6 text-center border-2 border-blue-100">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="text-2xl font-bold text-gray-900">35 mins</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center border-2 border-purple-100">
                <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="text-sm font-semibold text-gray-900">
                  Saved Address
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center border-2 border-green-100">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Support</p>
                <p className="text-sm font-semibold text-gray-900">
                  +1 (555) 123-4567
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <span className="text-gray-700">Your restaurant is preparing your food</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <span className="text-gray-700">
                    You'll receive a delivery partner assignment notification
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <span className="text-gray-700">
                    Track your order in real-time
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                    4
                  </span>
                  <span className="text-gray-700">Enjoy your meal!</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold py-4 rounded-xl">
                  Continue Shopping
                </Button>
              </Link>
              <button className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg">
                Track Order
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Thank you for ordering with Bomato!</p>
          <p className="mt-1">
            Have a question?{' '}
            <a href="#" className="text-orange-600 font-semibold hover:text-orange-700">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
