'use client'
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useState, useEffect } from "react"
import UserForm from "../form/UserForm"
import { Badge } from "../ui/badge"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import useAuth from "@/hooks/useAuth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getUserByQrCode } from "@/lib/api"
import { LoaderCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
export default function LoginPage() {
  const [result, setResult] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  useEffect(() => {
    const readerElement = document.getElementById('reader');

    if (readerElement && readerElement.offsetWidth > 0 && readerElement.offsetHeight > 0) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 1000,
          height: 1000
        },
        fps: 5,
      })

      // Add a timeout to ensure the image is fully loaded
      setTimeout(() => {
        scanner.render(success, error)
      }, 1000);

      function success(result) {
        scanner.clear()
        setResult(result)

      }

      function error(err) {
        // console.warn(err)
      }
    }
  }, [])


  useEffect(() => {
    const fetchData = async () => {
      if (result === null) return
      try {
        console.log(result)
        const response = await getUserByQrCode(result)
        if (response) {
          setUser(response.data.data[0]);
        }
      } catch (error) {
        setUser(null);
        setResult(null);
        toast("Error", {
          description: "User Not Found",
        })
        window.location.reload()
      }
    };
    fetchData();
  }, [result]);


  useEffect(() => {
    if (!user || !user.employee_id) return;
    attendance(user.employee_id);
  }, [user]);

  const attendance = async (id) => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${API_URL}/api/attendance/${id}`);
      const data = response.data;

      if (data && data.data.length === 0) {
        const timeInResponse = await axios.post(`${API_URL}/api/time_in`, {
          employee_id: id,
          attendance_id: uuidv4()
        });
        console.log(timeInResponse.data);
        toast.success(`Welcome ${user.name}, time in ${timeInResponse.data.data.time_in}`)
        window.location.reload()
      } else {
        console.log("data", data.data[0].time_in);
        const timeOutResponse = await axios.put(`${API_URL}/api/time_out/${data.data[0].attendance_id} `, {
          time_in: data.data[0].time_in
        });
        toast.success(`Goodbye ${user.name}, Time in ${timeOutResponse.data.time_in}, time out at ${timeOutResponse.data.time_out}.`);
        console.log(timeOutResponse.data);
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error?.response?.data.message || error.message);
      setTimeout(() => {
        window.location.reload();
      }, 3000); // 3-second delay
    }
  };

  // useEffect(() => {
  //   let timer;
  //   if (user && result) {
  //     timer = setTimeout(() => {
  //       // Reset user and result here
  //       setUser(null);
  //       setResult(null);
  //       window.location.reload()
  //     }, 5000); // 5000 milliseconds = 5 seconds
  //   }

  //   // Cleanup function
  //   return () => {
  //     if (timer) {
  //       clearTimeout(timer);
  //     }
  //   };
  // }, [user, result]);

  return (
    <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2">
      {/* QR Code Scanner Section */}
      <div className="flex flex-col items-center justify-center bg-muted/50">
        <h1 className="mb-4 text-2xl font-bold">QR Code Scanner</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Please scan your QR code to log your attendance.
        </p>
        <div id="reader" className="w-[400px] h-[400px] border-4 border-blue-500 rounded-lg  shadow-lg"></div>
        {!result && (
          <div className="flex items-center justify-center mt-4">
            <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Waiting for QR code...</span>
          </div>
        )}
      </div>

      {/* User Information Section */}
      <div className="flex flex-col items-center justify-center p-6">
        {user ? (
          <div className="p-4 mt-6 bg-white rounded-lg shadow-md text-zinc-950">
            <h2 className="text-lg font-bold">Welcome, {user.name}</h2>
            <p className="text-sm ">Department: {user.department}</p>
            <p className="text-sm ">Position: {user.position}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Scan your QR code to see your details.</p>
        )}
      </div>
    </div>
  );
}
