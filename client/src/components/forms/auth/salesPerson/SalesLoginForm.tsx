import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"

const schema = z.object({
  loginCode: z.string().min(6, "Your login code must be 6 characters"),
});

type FormData = z.infer<typeof schema>;

const SalesLoginForm = ({ className, ...props }: React.ComponentProps<"form">) => {
  const { handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      loginCode: "",
    },
  });

  const onSubmit = () => {
    // Handle login logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-muted-foreground text-sm text-balance pb-5">
          Enter the code sent by the admin
        </p>
        <div className="grid gap-6">
          <div className="grid gap-3 relative">
            <InputOTP maxLength={6} className="w-full flex">
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-gray-600" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={1} className="border-gray-600" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} className="border-gray-600" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="border-gray-600" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} className="border-gray-600" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={5} className="border-gray-600" />
              </InputOTPGroup>
            </InputOTP>
            {errors.loginCode && (
              <p className="text-red-500 text-sm">{errors.loginCode.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Proceed
          </Button>
        </div>
      </div>

    </form>
  )
}

export default SalesLoginForm