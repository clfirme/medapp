import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  
  if (!token){
    return res.status(401).json({error: 'Access Denied!'});
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.doctorID = decoded.doctorID;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).json({error: 'Access Denied!'});
  }
}

function verifyAdmin(req, res, next) {
  const token = req.header('Authorization');
  
  if (!token){
    return res.status(401).json({error: 'Access Denied!'});
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    
    // Verificar se é administrador
    if (!decoded.isAdmin) {
      return res.status(403).json({error: 'Esta ação requer privilégios de administrador'});
    }
    
    req.doctorID = decoded.doctorID;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).json({error: 'Access Denied!'});
  }
}

// Export default para compatibilidade com código existente
export default verifyToken;

// Export nomeado para novas importações mais explícitas
export { verifyToken, verifyAdmin };