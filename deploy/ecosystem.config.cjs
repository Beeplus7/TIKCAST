module.exports = {
  apps: [
    {
      name: 'tikcast-dashboard',
      cwd: '/var/www/tikcast/apps/dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005 -H 127.0.0.1',
      env: { NODE_ENV: 'production' },
      max_restarts: 20,
    },
    {
      name: 'tikcast-shop',
      cwd: '/var/www/tikcast',
      script: 'apps/shop-engine/index.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 20,
    },
    {
      name: 'tikcast-music',
      cwd: '/var/www/tikcast',
      script: 'apps/music-engine/index.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 20,
    },
    {
      name: 'tikcast-obs',
      cwd: '/var/www/tikcast',
      script: 'apps/obs-controller/index.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 20,
    },
    {
      name: 'tikcast-gateway',
      cwd: '/var/www/tikcast',
      script: 'apps/api-gateway/server.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 20,
    },
  ],
};
