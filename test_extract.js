function extractFromTitle(title) {
  if (!title) return null;
  
  const patterns = [
    / - ([^-]+)$/,   // "Article Title - Site Name"
    / \| ([^|]+)$/,  // "Article Title | Site Name"
    /^([^-]+) -/,    // "Site Name - Article Title"
    /^([^|]+) \|/    // "Site Name | Article Title"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

console.log('Test case: "Site Name - Article Title"');
console.log('Result:', extractFromTitle("Site Name - Article Title"));
console.log('Expected: Site Name');
