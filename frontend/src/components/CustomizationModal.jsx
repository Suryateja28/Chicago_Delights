import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function CustomizationModal({ item, isOpen, onClose }) {
  const { addToCart } = useCart();
  
  if (!isOpen || !item) return null;

  // Options
  const sizes = Object.keys(item.basePrices || {});
  const crusts = [
    { name: 'Classic Hand Tossed', price: 0 },
    { name: 'Wheat Thin Crust', price: 1.00 },
    { name: 'Cheese Burst Deluxe', price: 2.50 },
    { name: 'Garlic Parmesan Crust', price: 1.50 }
  ];

  const toppingsList = item.isVeg 
    ? [
        { name: 'Extra Mozzarella', price: 1.50 },
        { name: 'Sweet Corn', price: 0.80 },
        { name: 'Fresh Mushrooms', price: 1.00 },
        { name: 'Spicy Jalapenos', price: 0.80 },
        { name: 'Black Olives', price: 0.80 },
        { name: 'Marinated Paneer Cubes', price: 1.80 }
      ]
    : [
        { name: 'Extra Mozzarella', price: 1.50 },
        { name: 'Spicy Jalapenos', price: 0.80 },
        { name: 'Black Olives', price: 0.80 },
        { name: 'Smoked Chicken Grills', price: 2.20 },
        { name: 'Spicy Chicken Salami', price: 2.00 },
        { name: 'Pepperoni Slices', price: 2.50 }
      ];

  // Default selections
  const [selectedSize, setSelectedSize] = useState(sizes[1] || sizes[0]); // Default to second size (usually Personal 7")
  const [selectedCrust, setSelectedCrust] = useState(crusts[0]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Recalculate price when selections change
  useEffect(() => {
    const basePrice = item.basePrices[selectedSize] || 0;
    const crustPrice = selectedCrust.price;
    const toppingsPrice = selectedToppings.reduce((sum, topName) => {
      const top = toppingsList.find(t => t.name === topName);
      return sum + (top ? top.price : 0);
    }, 0);

    setTotalPrice((basePrice + crustPrice + toppingsPrice) * quantity);
  }, [selectedSize, selectedCrust, selectedToppings, quantity, item]);

  const handleToppingToggle = (toppingName) => {
    setSelectedToppings(prev => 
      prev.includes(toppingName)
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  const handleAddToCart = () => {
    const basePrice = item.basePrices[selectedSize] || 0;
    const crustPrice = selectedCrust.price;
    const toppingsPrice = selectedToppings.reduce((sum, topName) => {
      const top = toppingsList.find(t => t.name === topName);
      return sum + (top ? top.price : 0);
    }, 0);

    const singleItemPrice = basePrice + crustPrice + toppingsPrice;

    addToCart({
      ...item,
      size: selectedSize,
      crust: selectedCrust.name,
      toppings: selectedToppings,
      price: singleItemPrice,
      quantity: quantity
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Customize Pizza</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{item.name}</p>
          </div>
          <button onClick={onClose} style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} className="close-btn">✕</button>
        </div>

        {/* Form Fields */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Sizes */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              1. Choose Size
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {sizes.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: isSelected ? 'rgba(229, 45, 39, 0.08)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    className="size-option-btn"
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                      {size}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>
                      ₹{item.basePrices[size].toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crusts */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              2. Choose Crust
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {crusts.map((crust) => {
                const isSelected = crust.name === selectedCrust.name;
                return (
                  <div
                    key={crust.name}
                    onClick={() => setSelectedCrust(crust)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: isSelected ? 'rgba(255, 179, 0, 0.04)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-light)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    className="crust-option-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{crust.name}</span>
                    </div>
                    {crust.price > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        +₹{crust.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toppings */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              3. Extra Toppings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {toppingsList.map((topping) => {
                const isChecked = selectedToppings.includes(topping.name);
                return (
                  <div
                    key={topping.name}
                    onClick={() => handleToppingToggle(topping.name)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: isChecked ? 'rgba(0, 200, 83, 0.04)' : 'var(--bg-input)',
                      border: `1px solid ${isChecked ? 'var(--success)' : 'var(--border-light)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    className="topping-option-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        border: `2px solid ${isChecked ? 'var(--success)' : 'var(--border-light)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isChecked ? 'var(--success)' : 'transparent'
                      }}>
                        {isChecked && <span style={{ color: 'white', fontSize: '0.6rem' }}>✓</span>}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{topping.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      +₹{topping.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-input)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            >
              -
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            >
              +
            </button>
          </div>

          {/* Price & Submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Price</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent)' }}>
                ₹{totalPrice.toFixed(2)}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="glow-btn"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .size-option-btn:hover, .crust-option-card:hover, .topping-option-card:hover {
          border-color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
