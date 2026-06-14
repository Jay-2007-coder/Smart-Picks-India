export async function checkHubLimits(req, res, next) {
  // All Student Hub tools are completely free and unlimited for everyone.
  next();
}
