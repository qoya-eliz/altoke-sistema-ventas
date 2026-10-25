const app = require('./app');
require('./config/auth').getJwtSecret();
const port = Number(process.env.PORT || 5001);
app.listen(port, () => console.log(`ALTOKE POS 1.1 API disponible en puerto ${port}`));
