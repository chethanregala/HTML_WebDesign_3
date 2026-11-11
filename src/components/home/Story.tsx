import { storyChapters } from '../../data/experiences';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';

/** Section I — brand philosophy as an editorial spread. */
export function Story() {
  return (
    <section className="section section--dark story" id="story" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading
          label="SECTION I — OUR STORY"
          index="I"
          tone="dark"
          titleId="story-title"
          title={
            <>
              Rooted in flavour.
              <br />
              Open to <em>possibility</em>.
            </>
          }
          intro="TĀVA is a fictional demonstration restaurant, written to show how a modern Indian brand can sound: confident about its roots, curious about everything else."
        />

        <div className="story__spread">
          <Reveal className="story__statement">
            <p className="story__quote">
              We cook from memory, then edit until only the <em>essential</em> remains.
            </p>
            <div className="story__composition" aria-hidden="true">
              <span className="story__shape story__shape--circle" />
              <span className="story__shape story__shape--bar" />
              <span className="story__shape story__shape--square" />
              <span className="story__shape story__shape--line" />
              <span className="story__composition-label">ROOTED · OPEN · TOGETHER</span>
            </div>
          </Reveal>

          <ol className="story__chapters">
            {storyChapters.map((chapter, index) => (
              <Reveal
                as="li"
                key={chapter.index}
                delay={index * 90}
                className={`story__chapter ${index === 1 ? 'story__chapter--inverted' : ''}`}
              >
                <span className="story__chapter-index" aria-hidden="true">
                  {chapter.index}
                </span>
                <div>
                  <h3 className="story__chapter-title">{chapter.title}</h3>
                  <p className="story__chapter-body">{chapter.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
