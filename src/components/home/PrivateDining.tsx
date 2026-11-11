import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import { privateDiningExperiences } from '../../data/experiences';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';
import { PrivateDiningEnquiry } from '../private-dining/PrivateDiningEnquiry';

/** Section H — private dining and events. */
export function PrivateDining() {
  const [open, setOpen] = useState(false);

  if (!restaurant.privateDining.enabled) return null;

  return (
    <section
      className="section private-dining"
      id="private-dining"
      aria-labelledby="private-dining-title"
    >
      <div className="private-dining__ornament" aria-hidden="true">
        <span className="private-dining__ornament-ring" />
        <span className="private-dining__ornament-block" />
      </div>

      <div className="container">
        <SectionHeading
          label="SECTION H — PRIVATE DINING"
          index="H"
          tone="dark"
          titleId="private-dining-title"
          title={
            <>
              Some moments deserve
              <br />
              their own <em>table</em>.
            </>
          }
          intro="Discover a more personal way to gather, celebrate, and dine together."
        />

        <ul className="private-dining__grid">
          {privateDiningExperiences.map((experience, index) => (
            <Reveal
              as="li"
              key={experience.index}
              delay={index * 90}
              className="private-dining__card"
            >
              <span className="private-dining__index" aria-hidden="true">
                {experience.index}
              </span>
              <h3 className="private-dining__card-title">{experience.title}</h3>
              <p className="private-dining__card-body">{experience.body}</p>
              <ul className="private-dining__tags">
                {experience.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>

        <Reveal className="private-dining__cta">
          <button type="button" className="btn btn--light btn--lg" onClick={() => setOpen(true)}>
            <span className="btn__label">{restaurant.privateDining.ctaLabel}</span>
            <span className="btn__icon">
              <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </span>
          </button>
          <p className="private-dining__cta-note">{restaurant.privateDining.notice}</p>
        </Reveal>
      </div>

      <PrivateDiningEnquiry open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
