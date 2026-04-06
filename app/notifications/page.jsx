'use client'
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationsPageSkeleton } from "@/components/PageSkeletons";

const InboxPage = () => {
  const {
    getToken,
    user,
    authReady,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setUnreadNotificationsCount,
  } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadNotificationsCount(data.notifications.filter((notification) => !notification.read).length);
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
      const data = await markNotificationAsRead(notificationId);

      if (!data?.success) {
        toast.error(data?.message || 'Failed to mark as read');
        return;
      }

      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    if (markingAll || unreadCount === 0) {
      return;
    }

    setMarkingAll(true);

    try {
      const data = await markAllNotificationsAsRead();

      if (!data?.success) {
        toast.error(data?.message || 'Failed to mark all as read');
        return;
      }

      setNotifications((current) => current.map((notification) => ({
        ...notification,
        read: true,
      })));
      toast.success(data.message || 'All inbox messages marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      void fetchNotifications();
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inbox</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage updates from your orders, deliveries, and admin messages in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              {unreadCount} unread
            </span>
            <button
              onClick={markAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                markingAll || unreadCount === 0
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
              Your inbox is empty
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
                      className="ml-4 rounded-full bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
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

export default InboxPage;
