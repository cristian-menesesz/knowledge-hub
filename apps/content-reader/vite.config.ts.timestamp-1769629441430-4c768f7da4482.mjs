// vite.config.ts
import path from "path";
import federation from "file:///D:/repositories/knowledge-hub/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
import react from "file:///D:/repositories/knowledge-hub/apps/content-reader/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///D:/repositories/knowledge-hub/apps/content-reader/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "D:\\repositories\\knowledge-hub\\apps\\content-reader";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    federation({
      name: "contentReader",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
        "./ContentReader": "./src/components/ContentReader"
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^18.3.1"
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.3.1"
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: "^6.22.0"
        }
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 3011,
    cors: true
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXBvc2l0b3JpZXNcXFxca25vd2xlZGdlLWh1YlxcXFxhcHBzXFxcXGNvbnRlbnQtcmVhZGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxyZXBvc2l0b3JpZXNcXFxca25vd2xlZGdlLWh1YlxcXFxhcHBzXFxcXGNvbnRlbnQtcmVhZGVyXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9yZXBvc2l0b3JpZXMva25vd2xlZGdlLWh1Yi9hcHBzL2NvbnRlbnQtcmVhZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCBmZWRlcmF0aW9uIGZyb20gJ0BvcmlnaW5qcy92aXRlLXBsdWdpbi1mZWRlcmF0aW9uJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZmVkZXJhdGlvbih7XG4gICAgICBuYW1lOiAnY29udGVudFJlYWRlcicsXG4gICAgICBmaWxlbmFtZTogJ3JlbW90ZUVudHJ5LmpzJyxcbiAgICAgIGV4cG9zZXM6IHtcbiAgICAgICAgJy4vQXBwJzogJy4vc3JjL0FwcCcsXG4gICAgICAgICcuL0NvbnRlbnRSZWFkZXInOiAnLi9zcmMvY29tcG9uZW50cy9Db250ZW50UmVhZGVyJyxcbiAgICAgIH0sXG4gICAgICBzaGFyZWQ6IHtcbiAgICAgICAgcmVhY3Q6IHtcbiAgICAgICAgICBzaW5nbGV0b246IHRydWUsXG4gICAgICAgICAgcmVxdWlyZWRWZXJzaW9uOiAnXjE4LjMuMScsXG4gICAgICAgIH0sXG4gICAgICAgICdyZWFjdC1kb20nOiB7XG4gICAgICAgICAgc2luZ2xldG9uOiB0cnVlLFxuICAgICAgICAgIHJlcXVpcmVkVmVyc2lvbjogJ14xOC4zLjEnLFxuICAgICAgICB9LFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbSc6IHtcbiAgICAgICAgICBzaW5nbGV0b246IHRydWUsXG4gICAgICAgICAgcmVxdWlyZWRWZXJzaW9uOiAnXjYuMjIuMCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAxMSxcbiAgICBjb3JzOiB0cnVlLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStVLE9BQU8sVUFBVTtBQUVoVyxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFKN0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1QsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMLFdBQVc7QUFBQSxVQUNYLGlCQUFpQjtBQUFBLFFBQ25CO0FBQUEsUUFDQSxhQUFhO0FBQUEsVUFDWCxXQUFXO0FBQUEsVUFDWCxpQkFBaUI7QUFBQSxRQUNuQjtBQUFBLFFBQ0Esb0JBQW9CO0FBQUEsVUFDbEIsV0FBVztBQUFBLFVBQ1gsaUJBQWlCO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
