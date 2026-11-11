import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import { heroLabels } from '../../data/experiences';
import { menuItems, menuCategories } from '../../data/menu';
import { Reveal } from '../common/Reveal';

export function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      {/* Oversized ghost wordmark — pure typography */}
      <span className="hero__ghost" aria-hidden="true">
        TĀVA
      </span>

      <div className="hero__grid">
        <div className="hero__content">
          <Reveal className="hero__eyebrow" delay={60}>
            <span className="rule" aria-hidden="true" />
            <span className="label">{restaurant.descriptor}</span>
          </Reveal>

          <Reveal delay={140}>
            <h1 className="hero__title" id="hero-title">
              A different <em>point of view</em> on the Indian table.
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="hero__lede">
              Where familiar flavours meet fearless creativity. Discover a dining experience shaped
              by curiosity, craft, and the joy of coming together.
            </p>
          </Reveal>

          <Reveal className="hero__actions" delay={340}>
            <Link to="/menu" className="btn btn--primary btn--lg">
              <span className="btn__label">Explore the menu</span>
              <span className="btn__icon">
                <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
            </Link>
            <Link to="/#experience" className="btn btn--outline btn--lg">
              <span className="btn__label">Discover TĀVA</span>
            </Link>
          </Reveal>

          <Reveal className="hero__facts" delay={440}>
            <div className="hero__fact">
              <span className="hero__fact-value">{menuItems.length}</span>
              <span className="hero__fact-label">Dishes on the table</span>
            </div>
            <div className="hero__fact">
              <span className="hero__fact-value">{menuCategories.length}</span>
              <span className="hero__fact-label">Ways to explore</span>
            </div>
            <div className="hero__fact">
              <span className="hero__fact-value">01</span>
              <span className="hero__fact-label">Kitchen, no shortcuts</span>
            </div>
          </Reveal>
        </div>

        {/* Architectural composition — built entirely from CSS shapes */}
        <div className="hero__composition" aria-hidden="true">
          <div className="composition">
            <div className="composition__plane" />
            <div className="composition__grid" />
            <div className="composition__ring composition__ring--outer" />
            <div className="composition__ring composition__ring--inner" />
            <div className="composition__block" />
            <div className="composition__slab" />
            <div className="composition__arc" />
            <div className="composition__dot" />
            <div className="composition__cross composition__cross--one" />
            <div className="composition__cross composition__cross--two" />
            <div className="composition__label composition__label--top">POINT OF VIEW</div>
            <div className="composition__label composition__label--side">SERVED SINCE 2026</div>
            <div className="composition__stack">
              <span>TĀVA</span>
              <span>TĀVA</span>
              <span>TĀVA</span>
            </div>
            <div className="composition__caption">
              <span>01</span>
              <span>CONTEMPORARY</span>
              <span>INDIAN DINING</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__foot">
        <ul className="hero__ticker">
          {heroLabels.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <a href="#experience" className="hero__scroll" aria-label="Scroll to the experience section">
          <ArrowDown size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>SCROLL</span>
        </a>
      </div>
    </section>
  );
}
