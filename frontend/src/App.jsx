import React, { useState, useEffect } from 'react';
import { useCart } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import OutletSelector from './components/OutletSelector';
import CustomizationModal from './components/CustomizationModal';
import CartSidebar from './components/CartSidebar';
import OrderTracker from './components/OrderTracker';
import LoginModal from './components/LoginModal';
import RiderLoginModal from './components/RiderLoginModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import RiderPanel from './components/RiderPanel';
import BottomNav from './components/BottomNav';

function App() {
  const { selectedOutlet, activeOrder } = useCart();
  const [isOutletSelectOpen, setIsOutletSelectOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRiderLoginOpen, setIsRiderLoginOpen] = useState(false);
  const [isRiderPanelOpen, setIsRiderPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);

  // Automatically prompt for outlet selection on mount if none is selected
  useEffect(() => {
    if (!selectedOutlet) {
      setIsOutletSelectOpen(true);
    }
  }, [selectedOutlet]);

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header 
        onOpenOutletSelect={() => setIsOutletSelectOpen(true)} 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenRiderLogin={() => setIsRiderLoginOpen(true)}
        onOpenRiderPanel={() => setIsRiderPanelOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activeOrder ? (
          /* Live Order Tracking Page */
          <OrderTracker />
        ) : (
          /* Store Front ordering Flow */
          <>
            <Hero />
            <MenuSection 
              onOpenOutletSelect={() => setIsOutletSelectOpen(true)} 
              onOpenCustomize={(item) => setCustomizingItem(item)}
              onOpenLogin={() => setIsLoginOpen(true)}
            />
            <section id="our-story" className="story-section">
              <div className="story-panel glass">
                <h2>Our Story</h2>
                <p>From Uni Mall to your table, Chicago Delights serves bold veg pizza flavors, fast delivery and memorable BOGO offers. Every item is crafted for taste, freshness and satisfaction.</p>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Slide-out Cart Sidebar */}
      <CartSidebar onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Modals */}
      <OutletSelector 
        isOpen={isOutletSelectOpen} 
        onClose={() => setIsOutletSelectOpen(false)} 
      />

      <CustomizationModal 
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
      />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RiderLoginModal isOpen={isRiderLoginOpen} onClose={() => setIsRiderLoginOpen(false)} />
      <RiderPanel isOpen={isRiderPanelOpen} onClose={() => setIsRiderPanelOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />

      {/* Simple Footer */}
      <footer id="contact" style={{
        marginTop: 'auto',
        padding: '30px 24px',
        borderTop: '1px solid var(--border-light)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <p 
          style={{ cursor: 'default' }}
          onDoubleClick={() => setIsAdminLoginOpen(true)}
        >
          © 2026 Chicago Delights Pizza Inc.
        </p>
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => setIsAdminLoginOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.7rem' }}>Staff Login</button>
          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 8px' }}>|</span>
          <button onClick={() => setIsRiderLoginOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.7rem' }}>Driver Login</button>
        </div>
        <a
          href="https://wa.me/918146155737?text=Hi%20Chicago%20Delights%2C%20I%20want%20to%20place%20an%20order"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '12px',
            padding: '10px 18px',
            borderRadius: '999px',
            backgroundColor: '#25D366',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700'
          }}
        >
          💬 Message us on WhatsApp
        </a>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenLogin={() => setIsLoginOpen(true)} />
    </div>
  );
}

export default App;
