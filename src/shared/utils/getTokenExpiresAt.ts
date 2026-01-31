const getTokenExpiresAt = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

export { getTokenExpiresAt };
