import { experienceEntries } from '../../data/experiences';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';

/** Section B — the philosophy, told as an editorial index. */
export function Experience() {
  return (
    <section className="section section--dark experience" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading
          label="SECTION B — THE EXPERIENCE"
          index="B"
          titleId="experience-title"
          tone="dark"
          title={
            <>
              More than a meal.
              <br />
              A <em>point of view</em>.
            </>
          }
          intro="Three ideas hold the restaurant together. They shape what arrives on the plate, how it is served, and how the room feels when the last course is cleared."
        />

        <ol className="experience__list">
          {experienceEntries.map((entry, index) => (
            <Reveal as="li" key={entry.index} delay={index * 90} className="experience__item">
              <span className="experience__index" aria-hidden="true">
                {entry.index}
              </span>
              <div className="experience__copy">
                <h3 className="experience__title">{entry.title}</h3>
                <p className="experience__body">{entry.body}</p>
                <p className="experience__meta">{entry.meta}</p>
              </div>
              <span className="experience__glyph" aria-hidden="true" />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
