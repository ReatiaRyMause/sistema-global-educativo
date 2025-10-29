const cache = new Map();

export const cacheMiddleware = (duration = 300) => { // 5 minutos por defecto
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiry) {
      return res.json(cached.data);
    }

    // Sobrescribir res.json para cachear la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        expiry: Date.now() + (duration * 1000)
      });
      originalJson.call(this, data);
    };

    next();
  };
};