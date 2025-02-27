export function smoothScroll(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      const targetId = href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        const headerOffset = 80;
        // Get absolute position relative to document
        const elementTop = elem.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: elementTop - headerOffset,
          behavior: 'smooth'
        });
        
        // Update URL without page reload
        window.history.pushState(null, '', href);
      }
    }
}
  
  