const PRISMA_ERROR_MESSAGES = {
  P2002: 'Ya existe un registro con ese valor.',
  P2003: 'Referencia inválida.',
};

const sendError = (res, err, options = {}) => {
  const status = options.status || 500;
  const fallbackMessage = options.message || 'Error interno del servidor.';

  if (err && err.code && PRISMA_ERROR_MESSAGES[err.code]) {
    return res.status(400).json({ error: PRISMA_ERROR_MESSAGES[err.code] });
  }

  return res.status(status).json({ error: fallbackMessage });
};

module.exports = { sendError };
