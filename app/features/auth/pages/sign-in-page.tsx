import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/use-auth";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Loading from "~/shared/components/loading";
import { Link } from "react-router";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const SignInPage = () => {
  const { initialLoading, isLoading, login } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.email, values.password);
      if (process.env.NODE_ENV === "development") console.log(values);
    } catch (error) {
      console.error("Login failed", error);
      form.setError("email", { message: "Invalid email or password" });
      form.setError("password", { message: "Invalid email or password" });
    }
  };

  const isFormLoading = isLoading || initialLoading;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center justify-center w-full mx-auto h-screen overflow-hidden">
        <div className="flex justify-center items-center w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-96">
            <div className="space-y-1.5 text-center mb-5">
              <h1 className="text-2xl font-semibold text-foreground">Sign In</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email" className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="Email"
                            className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Email address"
                            {...field}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground text-sm">
                          Enter your email address to sign in.
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password" className="text-foreground">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Password"
                            {...field}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground text-sm">
                          Enter your password to sign in.
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={isFormLoading}
                    type="submit"
                    className="mt-4 py-6 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-all duration-200 hover:shadow-md"
                    aria-label="Sign in button"
                  >
                    {isFormLoading ? (
                      <span className="flex items-center justify-center">
                        <Loading size="20px" />
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
              <Link to="/register" className="w-full sm:w-1/2">
                <Button
                  disabled={isFormLoading}
                  variant="outline"
                  aria-label="Register button"
                  className="w-full py-6"
                >
                  Register
                </Button>
              </Link>
              <Button
                disabled={isFormLoading}
                variant="ghost"
                className="py-6 w-full sm:w-1/2 text-primary hover:text-primary/80 hover:bg-muted transition-all duration-200"
                aria-label="Forgot password link"
              >
                Forgot Password?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;