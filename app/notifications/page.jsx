'use client'
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationsPageSkeleton } from "@/components/PageSkeletons";

const Notifications = () => {
  const { getToken, user, authReady } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await getToken();
      await axios.post('/api/user/notifications',
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  useEffect(() => {
    if (authReady && user) {
      fetchNotifications();
    }
  }, [authReady, user]);

  if (loading) return (
    <>
      <Navbar />
      <NotificationsPageSkeleton />
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 md:px-16 lg:px-32 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Notifications;
