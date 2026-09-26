const admin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }
  
    if (
      !process.env.ADMIN_EMAIL ||
      req.user.email.toLowerCase() !==
        process.env.ADMIN_EMAIL.toLowerCase()
    ) {
      return res.status(403).json({
        message: "Admin access denied",
      });
    }
  
    next();
  };
  
  export default admin;