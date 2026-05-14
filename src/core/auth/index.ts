export { AuthProvider, useAuthContext } from "./AuthContext";
export * from "./authService";
export { OwnerOrPermissionGate, PermissionGate } from "./PermissionGate";
export { ProtectedRoute } from "./ProtectedRoute";
export { useAuth } from "./useAuth";

// Auth pages
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";

