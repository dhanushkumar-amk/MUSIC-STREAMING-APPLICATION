import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { authService } from "../../services/auth";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await authService.requestPasswordReset(data.email);
       toast.success("OTP sent to your email!");
       // Navigate to reset password page carrying the userId (if API returns it) or email to look it up/verify next step
       // API returns { message, userId }
       navigate("/auth/reset-password", { state: { userId: result.userId, email: data.email, mode: 'reset' } });
    } catch (error) {
       console.error(error);
      toast.error(error.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground">Enter your email address and we'll send you a code to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Code"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link to="/auth/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
