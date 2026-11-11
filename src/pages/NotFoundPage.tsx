import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/useLocalStorage';

export function NotFoundPage() {
  usePageMeta('Page not found — TĀVA');

  return (
    <section className="page page--not-found" aria-labelledby="not-found-title">
      <div className="container container--narrow">
        <span className="not-found__code" aria-hidden="true">
          404
        </span>
        <h1 className="not-found__title" id="not-found-title">
          This table isn’t set.
        </h1>
        <p className="not-found__body">
          The page you were looking for does not exist in this demonstration. Head back to the
          table and try again.
        </p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary btn--lg">
            <span className="btn__label">Back to home</span>
          </Link>
          <Link to="/menu" className="btn btn--outline btn--lg">
            <span className="btn__label">Discover the menu</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
