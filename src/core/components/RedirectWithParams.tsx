import { Navigate, useParams } from "react-router-dom";

interface RedirectWithParamsProps {
  to: string;
}

/**
 * A component that redirects to a new path while preserving URL parameters.
 * Replaces `:id` in the `to` string with the actual `id` param from the URL.
 */
export function RedirectWithParams({ to }: RedirectWithParamsProps) {
  const { id } = useParams();
  
  if (!id) {
    return <Navigate to={to.replace("/:id", "")} replace />;
  }

  return <Navigate to={to.replace(":id", id)} replace />;
}
