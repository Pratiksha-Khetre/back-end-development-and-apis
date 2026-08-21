export function authorizeModification(req, res, next) {
  const { role, id } = req.user;
  const requestedUserId = Number(req.params.userId);

  // Parents can modify any user's watchlist
  if (role === "parent") {
    return next();
  }

  // Children can modify only their own watchlist
  if (role === "child" && Number(id) === requestedUserId) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied"
  });
}