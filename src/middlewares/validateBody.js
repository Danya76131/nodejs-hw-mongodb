import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: true });
    if (error) {
      return next(createHttpError(400, error.details[0].message));
    }

    req.body = value;
    next();
  };
};
