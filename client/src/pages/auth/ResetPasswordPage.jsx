import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { PasswordInput } from "../../components/ui/password-input"
import { Label } from "../../components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "../../components/ui/input-otp"
import { authService } from "../../services/auth";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";

const resetPasswordSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Expect userId from previous step
  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
     if (!userId) {
         toast.error("Invalid session. Please try again.");
         navigate("/auth/forgot-password");
     }
  }, [userId, navigate]);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(userId, data.otp, data.newPassword);
      toast.success("Password reset successfully! Please login.");
      navigate("/auth/login");
    } catch (error) {
       console.error(error);
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-muted-foreground">
            Enter the code sent to <span className="font-semibold text-foreground">{email}</span> and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 flex flex-col items-center">
            <Label htmlFor="otp">One-Time Password (OTP)</Label>
            <Controller
                control={control}
                name="otp"
                render={({ field }) => (
                    <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                    </InputOTP>
                )}
            />
            {errors.otp && <p className="text-sm text-destructive">{errors.otp.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <PasswordInput id="newPassword" placeholder="••••••••" {...register("newPassword")} />
          {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <PasswordInput id="confirmNewPassword" placeholder="••••••••" {...register("confirmNewPassword")} />
          {errors.confirmNewPassword && <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
