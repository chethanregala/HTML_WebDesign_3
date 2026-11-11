import { Hero } from '../components/home/Hero';
import { Experience } from '../components/home/Experience';
import { MenuPreview } from '../components/home/MenuPreview';
import { Story } from '../components/home/Story';
import { PrivateDining } from '../components/home/PrivateDining';
import { VisitUs } from '../components/home/VisitUs';
import { usePageMeta } from '../hooks/useLocalStorage';

export function HomePage() {
  usePageMeta(
    'TĀVA — The Indian Table Reimagined | Contemporary Indian Dining',
    'Where familiar flavours meet fearless creativity. Explore the TĀVA menu, reserve a table, and plan private dining.',
  );

  return (
    <>
      <Hero />
      <Experience />
      <MenuPreview />
      <Story />
      <PrivateDining />
      <VisitUs />
    </>
  );
}
