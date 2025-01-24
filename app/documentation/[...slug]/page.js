async function DocumentationPage({ params }) {
  // Fetch all your data here
  const contentlet = await fetchContentlet(params);
  const documentation = await fetchDocumentation(params);
  const myPath = params.slug[0];
  const sideNav = await fetchSideNav();
  
  // Only fetch changelog data if needed
  const changelogData = myPath === 'changelogs' 
    ? await getChangelog({ page: 1 })
    : null;

  return (
    <Documentation
      contentlet={contentlet}
      documentation={documentation}
      myPath={myPath}
      sideNav={sideNav}
      changelogData={changelogData}
    />
  );
} 