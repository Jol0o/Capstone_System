import { registerUser } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

async function createUser({ email, password, id }) {
    console.log("email and password", email, password);
    const userForm = {
        email,
        password,
        user_id: id
    };
    try {
        const response = await registerUser(userForm);
        toast("Successful", {
            description: "Success creating an account!",
        });
        return response;
    } catch (error) {
        console.error('Registration failed:', error);
        toast("Error", {
            description: error.response?.data?.errors[0]?.msg || "An error occurred during registration.",
        });
        return null;
    }
}

export default createUser;