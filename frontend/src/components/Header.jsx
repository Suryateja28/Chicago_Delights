import React from 'react';
import { useCart } from '../context/CartContext';

export default function Header({ onOpenOutletSelect, onOpenLogin, onOpenRiderLogin, onOpenAdminLogin, onOpenAdminPanel, onOpenRiderPanel }) {
  const { selectedOutlet, cart, setIsCartOpen, activeOrder, setActiveOrder, latestOrder, user, logout, admin, adminLogout, rider, riderLogout } = useCart();
  const totalItems = cart.reduce((qty, item) => qty + item.quantity, 0);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-group" onClick={() => setActiveOrder(null)}>
          <img src="/logo.jpg" alt="Chicago Delights logo" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-title">Chicago Delights</span>
            <span className="brand-subtitle">Pizza & Grill</span>
          </div>
        </div>

        <nav className="site-nav">
          <button type="button" onClick={() => scrollToSection('home')} className="nav-link">Home</button>
          <button type="button" onClick={() => scrollToSection('menu-section-anchor')} className="nav-link">Menu</button>
          <button type="button" onClick={onOpenOutletSelect} className="nav-link">Store Locator</button>
          <button type="button" onClick={() => scrollToSection('our-story')} className="nav-link">Our Story</button>
          <button type="button" onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
        </nav>

        <div className="site-actions">
          <a
            href="https://wa.me/918146155737?text=Hi%20Chicago%20Delights%2C%20I%20want%20to%20place%20an%20order"
            target="_blank"
            rel="noreferrer"
            className="desktop-only"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 14px',
              borderRadius: '999px',
              backgroundColor: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              marginRight: '4px'
            }}
          >
            💬 WhatsApp Order
          </a>
          <button className="location-pill" onClick={onOpenOutletSelect}>
            <span>{selectedOutlet?.name || 'Select Store'}</span>
            <strong>Change</strong>
          </button>
          {user ? (
            <button className="login-pill desktop-only" onClick={logout}>
              <span>{user.name.split(' ')[0]}</span>
              <strong>Logout</strong>
            </button>
          ) : (
            <button className="login-pill desktop-only" onClick={onOpenLogin}>
              <span>Login</span>
              <strong>Sign In</strong>
            </button>
          )}
          {latestOrder && !activeOrder && (
            <button className="location-pill desktop-only" onClick={() => setActiveOrder(latestOrder)} style={{ backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none' }}>
              <span>🛵</span>
              <strong>Track Order</strong>
            </button>
          )}
          {rider && (
            <button className="login-pill desktop-only" onClick={onOpenRiderPanel}>
              <span>{rider.name.split(' ')[0]}</span>
              <strong>Dashboard</strong>
            </button>
          )}
          {admin && (
            <button className="login-pill desktop-only" onClick={onOpenAdminPanel}>
              <span>Admin</span>
              <strong>Panel</strong>
            </button>
          )}
          <button className="cart-pill desktop-only" onClick={() => setIsCartOpen(true)}>
            <span>🛒</span>
            <span>{totalItems || 'Cart'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
