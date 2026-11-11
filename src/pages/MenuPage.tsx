import { MenuExplorer } from '../components/menu/MenuExplorer';

export function MenuPage() {
  return (
    <section className="page page--menu" id="menu" aria-label="Menu discovery">
      <div className="container">
        <MenuExplorer />
      </div>
    </section>
  );
}
