'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from 'react-hot-toast';

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isRider, setIsRider] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [loadingUser, setLoadingUser] = useState(false)

    const fetchProductData = async () => {
        try {
            setLoadingProducts(true)
            const startTime = Date.now()
            const { data } = await axios.get('/api/product/list')
            const endTime = Date.now()
            console.log(`📦 Products fetched in ${endTime - startTime}ms`)
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoadingProducts(false)
        }
    }

    const fetchUserData = async () => {
        try {
            setLoadingUser(true)
            const role = user.publicMetadata.role
            if (role === 'seller' || role === 'admin') setIsSeller(true)
            if (role === 'admin') setIsAdmin(true)
            if (role === 'rider') setIsRider(true)

            const token = await getToken()
            const { data } = await axios.get('/api/user/data', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoadingUser(false)
        }
    }

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);

        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success("Item added to cart")
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success("Cart Updated")
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) totalCount += cartItems[items];
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData();
        } else {
            setUserData(false);
            setCartItems({});
            setIsSeller(false);
            setIsAdmin(false);
            setIsRider(false);
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        isAdmin, setIsAdmin,
        isRider, setIsRider,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        loadingProducts, loadingUser
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
