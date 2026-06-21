import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuSection({ onOpenOutletSelect, onOpenCustomize, onOpenLogin }) {
  const { selectedOutlet, user, addToCart, menuItems, loadingMenu } = useCart();

  // Dynamically extract categories from menuItems
  const categories = [...new Set(menuItems.map(item => item.category))];

  const [activeCategory, setActiveCategory] = useState('');

  // Auto-select the first category when menu loads
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories.join(','), activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    const target = document.getElementById(category.replace(/\s+/g, '-'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddItem = (item) => {
    if (!selectedOutlet) {
      onOpenOutletSelect();
      return;
    }

    if (!user) {
      onOpenLogin();
      return;
    }

    if (item.customizable) {
      onOpenCustomize(item);
    } else {
      // Direct add to cart
      addToCart({
        ...item,
        size: null,
        crust: null,
        toppings: [],
        quantity: 1
      });
    }
  };

  // Group items by category
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = menuItems.filter(item => item.category === cat);
    return acc;
  }, {});

  if (!selectedOutlet) {
    return (
      <div id="menu-section-anchor" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="glass" style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px' }}>🍕</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '10px' }}>
            Hungry for Deep Dish?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.6' }}>
            Please select an outlet near you to discover signature Chicago Delights pizzas, garlic bread, dessert sliders, and beverages.
          </p>
          <button 
            onClick={onOpenOutletSelect} 
            className="glow-btn"
            style={{ padding: '12px 36px', fontSize: '1rem' }}
          >
            Select Delivery Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="menu-section-anchor" className="menu-container">
      <div className="menu-banner glass">
        <div className="menu-board-panel">
          <div className="menu-board-header">
            <span className="menu-board-label">Chicago Delight's Pizza & Grill</span>
            <p className="menu-board-hero">Everyday</p>
            <h2>Free Pizza Offer</h2>
            <p>Buy 1 Get 1 FREE (Medium & Large Pizza)</p>
          </div>

          <div className="menu-board-offer">
            <div className="offer-block">
              <span className="offer-copy">BUY 1 &amp; GET 1</span>
              <strong className="offer-free">FREE</strong>
            </div>
            <p>Medium &amp; Large Pizza</p>
          </div>

          <div className="menu-board-meta">
            <span>All prices in ₹</span>
            <span>Toppings shown: Onion, Capsicum, Tomato, Corn</span>
          </div>
        </div>
      </div>

      <div className="menu-grid">
        <aside className="menu-sidebar glass">
          <div className="sidebar-title">Menu categories</div>
          <div className="category-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Menu Feed */}
        <div className="menu-content">
        {loadingMenu ? (
          <div className="loader-container">
            <div className="pizza-spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Preparing menu...</p>
          </div>
        ) : (
          categories.map((cat) => {
            const items = groupedItems[cat] || [];
            if (items.length === 0) return null;
            
            return (
              <section 
                key={cat} 
                id={cat.replace(/\s+/g, '-')} 
                className="menu-group"
              >
                <h2 className="group-title">{cat}</h2>
                <div className="pizza-grid" style={{ marginTop: '24px' }}>
                  {items.map((item) => {
                    const displayPrice = item.price;
                    return (
                      <div key={item._id || item.id} className="glass pizza-card">
                        <div className="pizza-card-img-container">
                          <img src={item.image} alt={item.name} className="pizza-card-img" />
                          {item.isBestSeller && (
                            <span className="best-seller-tag">Bestseller</span>
                          )}
                        </div>

                        <div className="pizza-card-info">
                          <div className="pizza-card-header">
                            <span className={`diet-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                              <span className="diet-dot"></span>
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </span>
                            
                            {item.spicyLevel > 0 && (
                              <span style={{ fontSize: '0.85rem' }}>
                                {'🌶️'.repeat(item.spicyLevel)}
                              </span>
                            )}
                          </div>

                          <h3 className="pizza-name" style={{ marginTop: '10px' }}>{item.name}</h3>
                          <p className="pizza-desc">{item.description}</p>

                          <div className="pizza-card-footer">
                            <div>
                              <span className="pizza-price-label">
                                {item.price != null ? 'Price' : 'Available'}
                              </span>
                              <div className="pizza-price-value">
                                {item.price != null ? `₹${displayPrice.toFixed(2)}` : 'Ask for flavour'}
                              </div>
                            </div>

                            {item.orderable ? (
                              <button
                                onClick={() => handleAddItem(item)}
                                className="pizza-add-btn"
                              >
                                Add +
                              </button>
                            ) : (
                              <button
                                disabled
                                className="pizza-add-btn"
                                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                              >
                                Info
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
    </div>
  );
}
