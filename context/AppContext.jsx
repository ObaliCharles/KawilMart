'use client'
import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from 'react-hot-toast';

export const AppContext = createContext();
const PRODUCT_CACHE_KEY = 'kawilmart_products_cache_v2';
const PRODUCT_CACHE_TTL_MS = 5 * 60 * 1000;

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = 'UGX '
    const router = useRouter()

    const { user, isLoaded: isUserLoaded } = useUser()
    const { getToken, isLoaded: isAuthLoaded } = useAuth()
    const authReady = isUserLoaded && isAuthLoaded

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isRider, setIsRider] = useState(false)
    const [resolvedRole, setResolvedRole] = useState(null)
    const [accessLoaded, setAccessLoaded] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [loadingUser, setLoadingUser] = useState(false)

    const persistProductsCache = (nextProducts) => {
        if (typeof window === 'undefined') {
            return
        }

        window.sessionStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            products: nextProducts,
        }))
    }

    const applyRoleAccess = (role) => {
        setResolvedRole(role || null)
        setIsSeller(role === 'seller' || role === 'admin')
        setIsAdmin(role === 'admin')
        setIsRider(role === 'rider' || role === 'admin')
    }

    const hydrateCachedProducts = () => {
        if (typeof window === 'undefined') {
            return false
        }

        try {
            const cached = window.sessionStorage.getItem(PRODUCT_CACHE_KEY)
            if (!cached) {
                return false
            }

            const parsed = JSON.parse(cached)
            if (!parsed?.products || !Array.isArray(parsed.products)) {
                return false
            }

            if (Date.now() - parsed.timestamp > PRODUCT_CACHE_TTL_MS) {
                return false
            }

            startTransition(() => {
                setProducts(parsed.products)
            })
            setLoadingProducts(false)
            return true
        } catch {
            return false
        }
    }

    const fetchProductData = async ({ background = false } = {}) => {
        try {
            if (!background) {
                setLoadingProducts(true)
            }

            let headers = {}

            if (authReady) {
                try {
                    const token = await getToken()
                    headers = token ? { Authorization: `Bearer ${token}` } : {}
                } catch {
                    headers = {}
                }
            }

            const startTime = Date.now()
            const { data } = await axios.get('/api/product/list', { headers })
            const endTime = Date.now()
            console.log(`📦 Products fetched in ${endTime - startTime}ms`)
            if (data.success) {
                startTransition(() => {
                    setProducts(data.products)
                })
                persistProductsCache(data.products)
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
            if (!authReady || !user) {
                return
            }

            setLoadingUser(true)
            setAccessLoaded(false)
            const fallbackRole = user.publicMetadata?.role || null
            applyRoleAccess(fallbackRole)

            const token = await getToken()
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
            const [userResponse, accessResponse] = await Promise.all([
                axios.get('/api/user/data', { headers }),
                axios.get('/api/auth/access', { headers }),
            ])

            if (accessResponse.data?.success) {
                const access = accessResponse.data.access
                applyRoleAccess(access?.role || fallbackRole)
            }

            if (userResponse.data.success) {
                setUserData(userResponse.data.user)
                setCartItems(userResponse.data.user.cartItems)
            } else {
                toast.error(userResponse.data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setAccessLoaded(true)
            setLoadingUser(false)
        }
    }

    const syncAdminAccess = async () => {
        try {
            if (!authReady || !user) {
                return { success: false, message: 'Not authenticated' }
            }

            setLoadingUser(true)
            setAccessLoaded(false)

            const token = await getToken()
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
            const { data } = await axios.post('/api/admin/set-admin', {}, { headers })

            if (data.success) {
                applyRoleAccess('admin')
                await fetchUserData()
            }

            return data
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        } finally {
            setAccessLoaded(true)
            setLoadingUser(false)
        }
    }

    const toggleProductLike = async (productId) => {
        try {
            if (!authReady || !user) {
                toast.error("Please sign in to like products")
                return { success: false, message: "Not authenticated" }
            }

            const token = await getToken()
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
            const { data } = await axios.post('/api/product/toggle-like', { productId }, { headers })

            if (data.success) {
                startTransition(() => {
                    setProducts((prevProducts) => {
                        const nextProducts = prevProducts.map((product) =>
                            product._id === productId ? { ...product, ...data.product } : product
                        )
                        persistProductsCache(nextProducts)
                        return nextProducts
                    })
                })
            } else {
                toast.error(data.message)
            }

            return data
        } catch (error) {
            toast.error(error.message)
            return {
                success: false,
                message: error.message,
            }
        }
    }

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);

        if (user) {
            try {
                const token = await getToken()
                const headers = token ? { Authorization: `Bearer ${token}` } : {}
                await axios.post('/api/cart/update', { cartData }, {
                    headers
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
                const headers = token ? { Authorization: `Bearer ${token}` } : {}
                await axios.post('/api/cart/update', { cartData }, {
                    headers
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

    const formatCurrency = (amount) => {
        const numericAmount = Number(amount)
        const safeAmount = Number.isFinite(numericAmount) ? Math.round(numericAmount) : 0
        return `${currency}${safeAmount.toLocaleString('en-UG')}`
    }

    const formatCompactCurrency = (amount) => {
        const numericAmount = Number(amount)
        const safeAmount = Number.isFinite(numericAmount) ? Math.round(numericAmount) : 0
        return `${currency}${new Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(safeAmount)}`
    }

    useEffect(() => {
        const hydrated = hydrateCachedProducts()
        fetchProductData({ background: hydrated })
    }, [])

    useEffect(() => {
        if (!authReady) {
            return
        }

        fetchProductData({ background: true })
    }, [authReady, user?.id])

    useEffect(() => {
        if (!authReady) {
            return
        }

        if (user) {
            fetchUserData();
        } else {
            setUserData(false);
            setCartItems({});
            applyRoleAccess(null);
            setAccessLoaded(true);
            setLoadingUser(false);
        }
    }, [authReady, user])

    const value = {
        user, getToken,
        authReady,
        accessLoaded,
        resolvedRole,
        syncAdminAccess,
        currency, router,
        formatCurrency, formatCompactCurrency,
        isSeller, setIsSeller,
        isAdmin, setIsAdmin,
        isRider, setIsRider,
        userData, fetchUserData,
        products, fetchProductData,
        toggleProductLike,
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
