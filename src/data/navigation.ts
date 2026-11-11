export interface NavItem {
  label: string;
  /** Router path, optionally with a hash for home-page sections. */
  to: string;
  /** Section id used for scroll-aware highlighting. */
  sectionId: string;
}

/**
 * Primary navigation. Section links resolve to anchors on the home page;
 * the router navigates home first and the ScrollToHash helper handles
 * the scroll, so links work from any route.
 */
export const navItems: NavItem[] = [
  { label: 'Home', to: '/', sectionId: 'home' },
  { label: 'Experience', to: '/#experience', sectionId: 'experience' },
  { label: 'Discover Menu', to: '/menu', sectionId: 'menu' },
  { label: 'Our Story', to: '/#story', sectionId: 'story' },
  { label: 'Private Dining', to: '/#private-dining', sectionId: 'private-dining' },
  { label: 'Visit Us', to: '/#visit', sectionId: 'visit' },
];

/** Section ids observed by the scroll spy while the home page is mounted. */
export const homeSectionIds: string[] = navItems
  .filter((item) => item.to.startsWith('/#'))
  .map((item) => item.sectionId);

export const routeFallbackSection: Record<string, string> = {
  '/menu': 'menu',
  '/': 'home',
};
