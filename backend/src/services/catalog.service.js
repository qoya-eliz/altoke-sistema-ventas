const catalogs = require('../repositories/catalog.repository');
module.exports = {
  getRoles: () => catalogs.getRoles(),
  getDocumentTypes: () => catalogs.getDocumentTypes(),
  getPaymentMethods: () => catalogs.getPaymentMethods(),
  getVoucherTypes: () => catalogs.getVoucherTypes(),
};
