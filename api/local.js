const app = require('./index');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Local Express server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
