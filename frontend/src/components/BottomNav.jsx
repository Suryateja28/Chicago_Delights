import React from 'react';
import { useCart } from '../context/CartContext';

export default function BottomNav({ onOpenLogin }) {
  const { cart, setIsCartOpen, user, activeOrder, setActiveOrder, latestOrder, logout } = useCart();
  const totalItems = cart.reduce((qty, item) => qty + item.quantity, 0);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="bottom-nav">
      <button className="bottom-nav-btn" onClick={() => scrollToSection('home')}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Home</span>
      </button>
      
      <button className="bottom-nav-btn" onClick={() => scrollToSection('menu-section-anchor')}>
        <span className="bottom-nav-icon">🍕</span>
        <span className="bottom-nav-label">Menu</span>
      </button>

      {latestOrder && !activeOrder && (
        <button className="bottom-nav-btn highlight" onClick={() => setActiveOrder(latestOrder)}>
          <span className="bottom-nav-icon">🛵</span>
          <span className="bottom-nav-label">Track</span>
        </button>
      )}

      <button className="bottom-nav-btn" onClick={() => setIsCartOpen(true)}>
        <div className="bottom-nav-icon cart-icon-wrapper">
          🛒
          {totalItems > 0 && <span className="bottom-nav-badge">{totalItems}</span>}
        </div>
        <span className="bottom-nav-label">Cart</span>
      </button>

      <button className="bottom-nav-btn" onClick={user ? logout : onOpenLogin}>
        <span className="bottom-nav-icon">{user ? '🚪' : '🔑'}</span>
        <span className="bottom-nav-label">{user ? 'Logout' : 'Login'}</span>
      </button>
    </nav>
  );
}
