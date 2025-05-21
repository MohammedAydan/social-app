import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/use-auth";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Link } from "react-router";

// ✅ Validation schema
const formSchema = z.object({
    firstName: z
        .string()
        .min(3, "First name must be at least 3 characters long")
        .nonempty("First name is required"),
    lastName: z
        .string()
        .min(3, "Last name must be at least 3 characters long")
        .nonempty("Last name is required"),
    userName: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .nonempty("Username is required"),
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    birthDate: z
        .string()
        .refine(
            (val) => {
                const date = new Date(val);
                return !isNaN(date.getTime()) && date < new Date();
            },
            { message: "Birth date must be in the past" }
        ),
    bio: z.string().max(1000, "Bio must be at most 1000 characters long").nonempty("Bio is required"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
        .nonempty("Password is required"),
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
    const { initialLoading, isLoading, register, errorMessage, errors } = useAuth();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            userName: "",
            email: "",
            birthDate: "",
            bio: "",
            password: "",
        },
    });

    const onSubmit = async (values: FormData) => {
        const formattedValues = {
            ...values,
            birthDate: new Date(values.birthDate), // ✅ Convert string to Date
        };

        await register(formattedValues); // ✅ Should now match CreateUserType
    };

    return (
        <div className="bg-background flex justify-center items-center pt-20">
            <div className="w-full max-w-md p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Sign Up</h1>
                    <p className="text-muted-foreground">Create a new account</p>
                </div>


                {(errorMessage || (errors && errors.length > 0)) && (
                    <div className="space-y-1.5 text-center mb-5 bg-foreground/10 p-4 rounded-md">
                        {errorMessage && (
                            <p className="text-destructive">{errorMessage}</p>
                        )}
                        {errors && errors.map((e, idx) => (
                            <p className="text-destructive" key={idx}>{e}</p>
                        ))}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {[
                            { name: "firstName", type: "text", placeholder: "First Name" },
                            { name: "lastName", type: "text", placeholder: "Last Name" },
                            { name: "userName", type: "text", placeholder: "Username" },
                            { name: "email", type: "email", placeholder: "Email" },
                            { name: "birthDate", type: "date", placeholder: "Birth Date" },
                        ].map(({ name, type, placeholder }) => (
                            <FormField
                                key={name}
                                control={form.control}
                                name={name as keyof FormData}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground capitalize">{placeholder}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type={type}
                                                placeholder={placeholder}
                                                autoComplete="off"
                                                className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write a short bio..."
                                            className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            autoComplete="off"
                                            className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading || initialLoading}
                            className="py-6 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-all duration-200 hover:shadow-md"
                        >
                            Register
                        </Button>
                    </form>
                </Form>

                <div className="text-center">
                    <Link
                        to="/sign-in"
                        className="block mt-4 text-sm text-muted-foreground hover:underline"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
