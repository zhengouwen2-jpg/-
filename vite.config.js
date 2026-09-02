import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function vacuumViewerRouteMiddleware(request, response, next) {
  const [pathname, query = ''] = (request.url || '').split('?');
  if (pathname !== '/vacuum-viewer' && pathname !== '/vacuum-viewer/') {
    next();
    return;
  }

  response.statusCode = 302;
  response.setHeader('Location', `/vacuum-viewer/index.html${query ? `?${query}` : ''}`);
  response.end();
}

const vacuumViewerRoute = {
  name: 'vacuum-viewer-route',
  configureServer(server) {
    server.middlewares.use(vacuumViewerRouteMiddleware);
  },
  configurePreviewServer(server) {
    server.middlewares.use(vacuumViewerRouteMiddleware);
  },
};

export default defineConfig({
  plugins: [vacuumViewerRoute, react()],
});
