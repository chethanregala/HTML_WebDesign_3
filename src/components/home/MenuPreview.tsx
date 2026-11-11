import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { menuItems, signatureItems } from '../../data/menu';
import { journeySteps } from '../../data/experiences';
import type { MenuItem } from '../../types';
import { formatINR } from '../../utils/pricing';
import { SPICE_LABELS } from '../../utils/filtering';
import { DishMark } from '../common/DishMark';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';
import { MenuDetailDrawer } from '../menu/MenuDetailDrawer';

/** Home-page teaser of the menu discovery experience (full explorer at /menu). */
export function MenuPreview() {
  const [selected, setSelected] = useState<MenuItem | null>(null);

  return (
    <>
      <section
        className="section section--light menu-preview"
        id="menu-preview"
        aria-labelledby="menu-preview-title"
      >
        <div className="container">
          <SectionHeading
            label="SECTION C — A TASTE OF THE MENU"
            index="C"
            titleId="menu-preview-title"
            title={
              <>
                Signature plates,
                <br />
                <em>first</em>.
              </>
            }
            intro="Four dishes that explain the kitchen better than any paragraph could. Open any plate to read its ingredients, allergens and customisations — or head into the full explorer to filter by diet, heat, flavour and price."
          />

          <ul className="signature-list">
            {signatureItems.slice(0, 4).map((item, index) => (
              <Reveal as="li" key={item.id} delay={index * 70} className="signature-row">
                <button
                  type="button"
                  className="signature-row__button"
                  onClick={() => setSelected(item)}
                  aria-label={`View details for ${item.name}`}
                >
                  <span className="signature-row__index">{String(index + 1).padStart(2, '0')}</span>
                  <DishMark seed={item.id} size="sm" className="signature-row__mark" />
                  <span className="signature-row__main">
                    <span className="signature-row__name">{item.name}</span>
                    <span className="signature-row__desc">{item.description}</span>
                  </span>
                  <span className="signature-row__meta">
                    <span className="signature-row__spice">{SPICE_LABELS[item.spice]}</span>
                    <span className="signature-row__price">{formatINR(item.price)}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>

          <Reveal className="menu-preview__cta">
            <Link to="/menu" className="btn btn--primary btn--lg">
              <span className="btn__label">
                Open the full menu explorer ({menuItems.length} dishes)
              </span>
              <span className="btn__icon">
                <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How the ordering enquiry works — honest, three steps */}
      <section className="journey" aria-labelledby="journey-title">
        <div className="container">
          <Reveal className="journey__head">
            <span className="label">HOW ORDERING WORKS HERE</span>
            <h2 className="journey__title" id="journey-title">
              Choose. Customise. Enquire.
            </h2>
            <p className="journey__intro">
              This demonstration prepares requests — it never places a real order or takes payment.
              The restaurant confirms everything with you directly.
            </p>
          </Reveal>

          <ol className="journey__steps">
            {journeySteps.map((step, index) => (
              <Reveal as="li" key={step.index} delay={index * 90} className="journey__step">
                <span className="journey__index" aria-hidden="true">
                  {step.index}
                </span>
                <span className="journey__label">{step.label}</span>
                <h3 className="journey__step-title">{step.title}</h3>
                <p className="journey__step-body">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <MenuDetailDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
