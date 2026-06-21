import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [rider, setRider] = useState(null);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(true);
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [orderTakingOpen, setOrderTakingOpen] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');

  // Fetch Outlets
  useEffect(() => {
    const savedUser = localStorage.getItem('chicago_delights_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedRider = localStorage.getItem('chicago_delights_rider');
    if (savedRider) {
      setRider(JSON.parse(savedRider));
    }

    const savedAdmin = localStorage.getItem('chicago_delights_admin');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }

    const fetchOrderIntake = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/order-taking`);
        if (res.ok) {
          const data = await res.json();
          setOrderTakingOpen(data.open);
        }
      } catch (err) {
        console.warn('Could not fetch order intake status:', err.message);
      }
    };
    fetchOrderIntake();

    const fetchOutlets = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/outlets`);
        if (!res.ok) throw new Error('Failed to load outlets');
        const data = await res.json();
        setOutlets(data);
        // Automatically check localStorage for previously selected outlet
        const savedOutlet = localStorage.getItem('chicago_delights_outlet');
        if (savedOutlet) {
          const parsed = JSON.parse(savedOutlet);
          const match = data.find(o => o.id === parsed.id || o._id === parsed._id);
          if (match) {
            setSelectedOutlet(match);
          }
        } else if (data.length === 1) {
          setOutlet(data[0]);
        }
      } catch (err) {
        console.error("Failed to load outlets:", err);
      } finally {
        setLoadingOutlets(false);
      }
    };
    fetchOutlets();
  }, []);

  // Fetch active orders when user logs in or is restored from localStorage
  useEffect(() => {
    if (user && user.phone) {
      const fetchCustomerOrders = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/orders/customer/${user.phone}`);
          if (res.ok) {
            const orders = await res.json();
            if (orders && orders.length > 0) {
              const recentOrder = orders[0];
              // If the recent order is still active, restore it to tracking panel
              if (recentOrder.status !== 'Delivered' && recentOrder.status !== 'Cancelled') {
                setActiveOrder(recentOrder);
                setLatestOrder(recentOrder);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch customer orders:", err);
        }
      };
      fetchCustomerOrders();
    }
  }, [user]);

  // Update localStorage when outlet is set

  const setOutlet = (outlet) => {
    setSelectedOutlet(outlet);
    if (outlet) {
      localStorage.setItem('chicago_delights_outlet', JSON.stringify(outlet));
    } else {
      localStorage.removeItem('chicago_delights_outlet');
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('chicago_delights_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setActiveOrder(null);
    setLatestOrder(null);
    setCart([]); // Clear cart to prevent multi-customer state leaking
    localStorage.removeItem('chicago_delights_user');
  };

  const adminLogin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('chicago_delights_admin', JSON.stringify(adminData));
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('chicago_delights_admin');
  };

  const riderLogin = (riderData) => {
    setRider(riderData);
    localStorage.setItem('chicago_delights_rider', JSON.stringify(riderData));
  };

  const riderLogout = () => {
    setRider(null);
    localStorage.removeItem('chicago_delights_rider');
  };

  const toggleOrderTaking = async (open) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/order-taking`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': admin?.token || ''
        },
        body: JSON.stringify({ open })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Could not update order intake status');
      }
      const data = await res.json();
      setOrderTakingOpen(data.open);
      return data.open;
    } catch (err) {
      console.error('Order intake update failed:', err.message);
      alert('Unable to update order intake status.');
      return null;
    }
  };

  const assignRiderToOrder = async (orderId, riderData) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/assign-rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riderData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Could not assign rider');
      }
      const updatedOrder = await res.json();
      setActiveOrder(updatedOrder);
      return updatedOrder;
    } catch (err) {
      console.error('Rider assignment failed:', err.message);
      alert('Unable to assign rider. Please try again.');
      return null;
    }
  };

  // Add Item to Cart
  const addToCart = (item) => {
    const itemKey = item._id || item.id;
    setCart((prevCart) => {
      // Check if exact same item (same customizations) already exists
      const existingIndex = prevCart.findIndex(
        (cartItem) => {
          const cartItemKey = cartItem._id || cartItem.id;
          return (
            cartItemKey === itemKey &&
            cartItem.size === item.size &&
            cartItem.crust === item.crust &&
            JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings)
          );
        }
      );

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + (item.quantity || 1)
        };
        return updatedCart;
      }

      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
    setIsCartOpen(true); // Open the cart to show progress
  };

  // Remove Item from Cart
  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  // Update Quantity
  const updateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      const newQty = updatedCart[index].quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((_, i) => i !== index);
      }
      updatedCart[index].quantity = newQty;
      return updatedCart;
    });
  };

  // Helper: check if it's BOGO eligible (Wednesday or Friday, and is a Pizza that is Medium, Large, or Monster)
  const isBogoDay = () => {
    const day = new Date().getDay(); // 0 is Sunday, 3 is Wed, 5 is Fri
    return day === 3 || day === 5;
  };

  // Calculate pricing
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto calculate BOGO discount or Coupon Discount
  useEffect(() => {
    let disc = 0;
    
    // Apply BOGO discount automatically on Wed/Fri
    if (isBogoDay()) {
      // Group pizzas that are Medium/Large/Monster
      const eligiblePizzas = [];
      cart.forEach((item, index) => {
        const isPizza = item.category.toLowerCase().includes('pizza');
        const isEligibleSize = ['medium 10"', 'large 13"', 'monster 24"'].includes((item.size || '').toLowerCase());
        if (isPizza && isEligibleSize) {
          for (let i = 0; i < item.quantity; i++) {
            eligiblePizzas.push({ price: item.price, index });
          }
        }
      });

      // Sort eligible pizzas descending in price
      eligiblePizzas.sort((a, b) => b.price - a.price);

      // Buy 1 Get 1 Free means for every pair, the cheaper one is free
      let freeCount = Math.floor(eligiblePizzas.length / 2);
      for (let i = 0; i < freeCount; i++) {
        // Free pizzas start from the bottom half (the cheaper ones in each pair)
        const freeItem = eligiblePizzas[eligiblePizzas.length - 1 - i];
        disc += freeItem.price;
      }
      if (disc > 0 && !couponApplied) {
        setCouponApplied('BOGO_AUTO');
      }
    }

    // Apply manual coupon code discounts
    if (couponApplied === 'CHICAGODELIGHTS') {
      disc = subtotal * 0.20; // 20% off
    } else if (couponApplied === 'FREEGD' && subtotal >= 30) {
      disc = 5.49; // Flat value of Garlic Bread
    }

    setDiscountAmount(disc);
  }, [cart, couponApplied, subtotal]);

  // Apply Manual Coupon Code
  const applyCoupon = (code) => {
    setCouponError('');
    const formattedCode = code.trim().toUpperCase();

    if (isBogoDay()) {
      setCouponError('Automatic BOGO is active! Other coupons cannot be combined.');
      return false;
    }

    if (formattedCode === 'CHICAGODELIGHTS') {
      setCouponApplied('CHICAGODELIGHTS');
      return true;
    } else if (formattedCode === 'FREEGD') {
      if (subtotal < 30) {
        setCouponError('Minimum order value of ₹30.00 required for FREEGD.');
        return false;
      }
      setCouponApplied('FREEGD');
      return true;
    } else {
      setCouponError('Invalid coupon code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponApplied('');
    setDiscountAmount(0);
    setCouponCode('');
  };

  const computedDeliveryCharge = deliveryType === 'delivery' && subtotal > 0 ? 10 : 0;
  const deliveryTotal = Math.max(0, subtotal - discountAmount + computedDeliveryCharge);
  const total = deliveryTotal;

  // Submit checkout order
  const submitOrder = async (customerDetails) => {
    if (!selectedOutlet) {
      alert("Please select a pizza outlet first!");
      return null;
    }

    if (!user) {
      alert('Please login before placing your order.');
      return null;
    }

    try {
      const orderPayload = {
        outletId: selectedOutlet.id || selectedOutlet._id,
        outletName: selectedOutlet.name,
        items: cart.map(item => ({
          name: item.name,
          category: item.category,
          size: item.size || null,
          crust: item.crust || null,
          toppings: item.toppings || [],
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        discount: discountAmount,
        deliveryType,
        deliveryCharge: computedDeliveryCharge,
        total,
        customer: {
          ...customerDetails,
          address: deliveryType === 'dine-in' ? `Dine-in at ${selectedOutlet.name}` : customerDetails.address
        }
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error('Order submission failed');
      const order = await res.json();
      
      setActiveOrder(order);
      setLatestOrder(order);
      setCart([]); // Reset Cart
      setCouponApplied('');
      setDiscountAmount(0);
      setIsCartOpen(false);
      return order;
    } catch (err) {
      console.error("Submit order error:", err);
      alert("Could not process order. Please try again.");
      return null;
    }
  };

  const trackActiveOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const order = await res.json();
      setActiveOrder(order);
      setLatestOrder(order);
      return order;
    } catch (err) {
      console.error("Order tracking error:", err);
    }
  };

  return (
    <CartContext.Provider value={{
      outlets,
      selectedOutlet,
      setOutlet,
      menuItems,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      isCartOpen,
      setIsCartOpen,
      activeOrder,
      setActiveOrder,
      latestOrder,
      setLatestOrder,
      user,
      admin,
      rider,
      login,
      logout,
      adminLogin,
      adminLogout,
      riderLogin,
      riderLogout,
      loadingMenu,
      loadingOutlets,
      deliveryType,
      setDeliveryType,
      deliveryCharge: computedDeliveryCharge,
      orderTakingOpen,
      toggleOrderTaking,
      subtotal,
      discountAmount,
      total,
      couponCode,
      setCouponCode,
      couponApplied,
      applyCoupon,
      removeCoupon,
      couponError,
      submitOrder,
      trackActiveOrder,
      assignRiderToOrder,
      isBogoDay
    }}>
      {children}
    </CartContext.Provider>
  );
};
