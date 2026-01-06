import { useContext, createContext } from "react";

/* Initialize with undefined instead of null so error check only triggers when
used outside provider, not when user isn't logged in */
export const AuthContext = createContext(undefined);

// Hook used in components to access auth data and functions (defined in value obj in authProvider)
export const useAuthContext = () => {
  /* useContext access current context value for AuthContext (looks at the value of the component
  it's nested in and continues up the tree until it finds <AuthContext.Provider>) */
  const context = useContext(AuthContext); // This should be the 'value' object in authProvider
  // Trigger error if useAuthContext used outside provider
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
