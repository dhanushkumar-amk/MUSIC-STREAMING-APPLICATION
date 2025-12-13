import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "../../components/ui/input-otp";
import { authService } from "../../services/auth";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid session. Please login again.");
      navigate("/auth/login");
    }
  }, [userId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    try {
      const result = await authService.verifyOTP(userId, otp);
      toast.success("Logged in successfully!");
      navigate("/home");
    } catch (error) {
        console.error(error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Verify OTP</h1>
        <p className="text-muted-foreground">
            We sent a code to <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center">
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
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
        </div>

        <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
            type="button"
            className="text-muted-foreground hover:text-primary underline"
            onClick={() => navigate("/auth/login")}
        >
            Back to Login
        </button>
      </div>
    </div>
  );
}
