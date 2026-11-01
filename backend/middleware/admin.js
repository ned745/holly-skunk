const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
 const authHeader = req.header('Authorization');
 if (!authHeader) {
  return res.status(401).json({ error: 'Access Denied: Missing session authorization token.' });
 }
 const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
  req.user = decoded;
  if (req.user.role !== 'Admin') {
   return res.status(403).json({ error: 'Forbidden Access: Administrative clearance token required.' });
  }
  next();
 } catch (err) {
  res.status(401).json({ error: 'Access Denied: Session token is expired or altered.' });
 }
};
