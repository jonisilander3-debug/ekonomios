module.exports = {
  apps: [
    {
      name: 'ekonomi-api',
      cwd: '/var/www/ekonomi-os',
      script: 'corepack',
      args: 'pnpm --filter @ekonomi/api start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: '4000'
      }
    },
    {
      name: 'ekonomi-web',
      cwd: '/var/www/ekonomi-os',
      script: 'corepack',
      args: 'pnpm --filter @ekonomi/web start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      }
    }
  ]
};
