import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  const AuthContext = createContext();
  
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
      try {
        const savedUser =
          localStorage.getItem("ceresea-user");
  
        return savedUser
          ? JSON.parse(savedUser)
          : null;
      } catch {
        return null;
      }
    });
  
    const [token, setToken] = useState(() => {
      return localStorage.getItem("ceresea-token") || null;
    });
  
    useEffect(() => {
      if (user) {
        localStorage.setItem(
          "ceresea-user",
          JSON.stringify(user)
        );
      } else {
        localStorage.removeItem("ceresea-user");
      }
    }, [user]);
  
    useEffect(() => {
      if (token) {
        localStorage.setItem(
          "ceresea-token",
          token
        );
      } else {
        localStorage.removeItem("ceresea-token");
      }
    }, [token]);
  
    const login = (userData, authToken) => {
      setUser(userData);
      setToken(authToken);
    };
  
    const logout = () => {
      setUser(null);
      setToken(null);
    };
  
    return (
      <AuthContext.Provider
        value={{
          user,
          token,
          isAuthenticated: Boolean(user && token),
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside an AuthProvider"
      );
    }
  
    return context;
  }