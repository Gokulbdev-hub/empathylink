import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@empathylink/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@empathylink/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
      '@empathylink/validation': path.resolve(__dirname, 'packages/validation/src/index.ts'),
      '@empathylink/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@empathylink/service-ai': path.resolve(__dirname, 'services/ai/src/index.ts'),
      '@empathylink/service-matching': path.resolve(__dirname, 'services/matching/src/index.ts'),
      '@empathylink/service-chat': path.resolve(__dirname, 'services/chat/src/index.ts'),
      '@empathylink/service-moderation': path.resolve(__dirname, 'services/moderation/src/index.ts'),
      '@empathylink/service-notifications': path.resolve(__dirname, 'services/notifications/src/index.ts'),
    },
  },
});
