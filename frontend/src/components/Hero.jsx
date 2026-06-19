import React from 'react';

export default function Hero() {
  const scrollToMenu = () => {
    const menuEl = document.getElementById('menu-section-anchor');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-hero" id="home">
      <div className="hero-content">
        <div className="hero-copy">
          <span className="hero-tag">TWICE THE WOW!</span>
          <h1>SUPER CHEESY<br />DOUBLE BURST</h1>
          <p className="hero-lead">A cheesy, crunchy veg pizza experience from Uni Mall — made to wow every slice.</p>

          <div className="hero-actions">
            <button onClick={scrollToMenu} className="glow-btn hero-action">ORDER NOW</button>
          </div>

          <div className="hero-price-strip">
            <span>Medium & Large</span>
            <span>Buy 1 Get 1 FREE</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-pizza-frame">
            <img src="/images/hero_pizza.png" alt="Super Cheesy Double Burst Pizza" className="hero-pizza-img floating-pizza" />
            <div className="hero-button-overlay">
              <button onClick={scrollToMenu} className="glow-btn hero-action small">ORDER NOW</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
