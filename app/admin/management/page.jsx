'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import Image from 'next/image';

const roleColors = {
    admin: 'bg-red-100 text-red-700',
    seller: 'bg-blue-100 text-blue-700',
    rider: 'bg-purple-100 text-purple-700',
    buyer: 'bg-green-100 text-green-700',
};

export default function AdminManagement() {
    const { getToken, user } = useAppContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageData, setMessageData] = useState({ subject: '', content: '' });

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setUsers(data.users);
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateUserDetails = async (userId, updates) => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/update-user',
                { userId, updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
                toast.success('User updated successfully');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    const sendMessage = async () => {
        if (!selectedUser || !messageData.subject || !messageData.content) return;

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/send-message',
                {
                    to: selectedUser.id,
                    subject: messageData.subject,
                    content: messageData.content
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Message sent successfully');
                setShowModal(false);
                setMessageData({ subject: '', content: '' });
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const toggleVerification = async (userId, currentStatus) => {
        await updateUserDetails(userId, { isVerified: !currentStatus });
    };

    if (loading) return <Loading />;

    return (
        <div className="w-full md:p-10 p-4">
            <h2 className="pb-4 text-lg font-medium">User Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center space-x-4 mb-4">
                            <Image
                                src={user.imageUrl}
                                alt={user.name}
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                            <div>
                                <h3 className="font-medium">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            {user.role === 'seller' && (
                                <>
                                    <p><strong>Business:</strong> {user.businessName || 'Not set'}</p>
                                    <p><strong>Location:</strong> {user.businessLocation || 'Not set'}</p>
                                    <p><strong>Phone:</strong> {user.phoneNumber || 'Not set'}</p>
                                    <p><strong>License:</strong> {user.businessLicense || 'Not set'}</p>
                                </>
                            )}

                            {user.role === 'rider' && (
                                <>
                                    <p><strong>Vehicle:</strong> {user.vehicleType || 'Not set'}</p>
                                    <p><strong>Plate:</strong> {user.licensePlate || 'Not set'}</p>
                                    <p><strong>License:</strong> {user.driversLicense || 'Not set'}</p>
                                </>
                            )}

                            <p><strong>Verified:</strong> {user.isVerified ? '✅ Yes' : '❌ No'}</p>
                        </div>

                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={() => {
                                    setSelectedUser(user);
                                    setShowModal(true);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Message
                            </button>
                            <button
                                onClick={() => toggleVerification(user.id, user.isVerified)}
                                className={`px-3 py-1 text-sm rounded ${
                                    user.isVerified
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                {user.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Send Message to {selectedUser.name}</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Subject"
                                value={messageData.subject}
                                onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded"
                            />

                            <textarea
                                placeholder="Message content"
                                value={messageData.content}
                                onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded h-32 resize-none"
                            />
                        </div>

                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Send
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setMessageData({ subject: '', content: '' });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}