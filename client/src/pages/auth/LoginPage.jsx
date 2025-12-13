import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input"
import { Label } from "../../components/ui/label";
import { authService } from "../../services/auth";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await authService.login(data.email, data.password);

      if (result.success && result.accessToken) {
        toast.success("Login successful!");
        // Tokens are already stored by authService.login()
        // Redirect to home page
        navigate("/home");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/auth/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
