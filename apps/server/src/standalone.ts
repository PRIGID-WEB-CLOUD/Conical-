import { createApiApp } from './index.js';

const app = createApiApp();
const PORT = process.env.API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Chronicle REST & AI API Server running independently on port ${PORT}`);
});
