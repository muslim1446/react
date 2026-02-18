// =========================================================================
// GITHUB.IO -> PAGES.DEV REDIRECT
// If user visits the old github.io domain, redirect to pages.dev
// =========================================================================
export function checkGithubRedirect() {
  if (window.location.hostname.includes('github.io')) {
    const newUrl = window.location.href.replace(/github\.io/, 'pages.dev');
    window.location.replace(newUrl);
  }
}
