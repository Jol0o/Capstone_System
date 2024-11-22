import { toast } from "sonner";

const uploadToCloudinary = async (selectedFile, setIsloading) => {
    try {
        const formData = new FormData();
        if (typeof input === 'string') {
            formData.append("file", selectedFile);
        } else {
            formData.append("file", selectedFile);
        }
        formData.append("upload_preset", "gasbee");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dcd63yljq/auto/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to upload image. Status: ${response.status}`);
        }
        const url = await response.json();
        console.log(url)
        return url.url
    } catch (error) {
        toast.error(error.message);
    } finally {
        setIsloading(false);
    }
};

export default uploadToCloudinary;
