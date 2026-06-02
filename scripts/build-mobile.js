const { execSync } = require('child_process');

try {
  console.log('Building Next.js...');
  // We try a normal build first.
  // Note: Static export (output: export) is currently disabled in next.config.ts
  // because API routes in App Router are dynamic.
  // For now, we use Capacitor Live Reload.
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Syncing Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

  console.log('Mobile prep completed.');
} catch (error) {
  console.error('Build/Sync failed:', error);
}
