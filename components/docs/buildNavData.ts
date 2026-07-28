export type BuildNavLink = { id: string; label: string; href?: string; target?: string };

export type BuildNavSection = {
  id: string;
  title: string;
  items: BuildNavLink[];
};
