import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/core/auth/useAuth";
import { loginSchema, type LoginPayload } from "@/shared/types/schemas";
import { handleFormError } from "@/lib/errors/handleFormError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sprout } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      const urlParams = new URLSearchParams(window.location.search);
      const queryFrom = urlParams.get("from");
      const from = (location.state as { from?: string })?.from || queryFrom || "/inventory";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      handleFormError(err, form, "Invalid credentials");
    }
  });

  return (
    <div className="min-h-screen flex">
      {/* ── Branded Sidebar ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 dark:bg-primary/10 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 p-4 rounded-2xl bg-primary/10 w-fit">
            <Sprout className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Plant Lab Inventory
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A comprehensive laboratory inventory management system for
            agricultural research. Track samples, experiments, equipment, and
            business operations.
          </p>
        </div>
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Form Section ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sprout className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Plant Lab</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access Plant Lab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign in
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
