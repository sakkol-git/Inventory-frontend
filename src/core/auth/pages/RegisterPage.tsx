// ═══════════════════════════════════════════════════════════════════════════
// Register Page — Enhanced with branded sidebar + password strength meter.
// Phase 10.1 / 10.2 — Auth page enhancements.
// ═══════════════════════════════════════════════════════════════════════════

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
import { PasswordStrengthMeter } from "@/shared/components/PasswordStrengthMeter";
import { registerSchema, type RegisterPayload } from "@/shared/types/schemas";
import { handleFormError } from "@/lib/errors/handleFormError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sprout } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const passwordValue = watch("password", "");

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUser(data);
      toast.success("Account created successfully!");
      navigate("/inventory", { replace: true });
    } catch (err: unknown) {
      handleFormError(err, form, "Registration failed");
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
            Join Plant Lab
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Create your account to start managing your laboratory inventory,
            tracking experiments, and collaborating with your research team.
          </p>
        </div>
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
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>
              Register to access Plant Lab Laboratory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          autoComplete="tel"
                          {...field}
                          value={field.value ?? ""}
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
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      {passwordValue && (
                        <PasswordStrengthMeter password={passwordValue} />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
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
                  Create Account
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
