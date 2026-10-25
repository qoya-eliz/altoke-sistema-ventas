function getJwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value || !value.trim()) {
    throw new Error('Configure JWT_SECRET en backend/.env antes de iniciar el servidor.');
  }
  return value;
}
module.exports = { getJwtSecret };
