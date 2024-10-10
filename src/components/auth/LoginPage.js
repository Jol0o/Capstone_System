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

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
export default function LoginPage() {
  const [result, setResult] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const readerElement = document.getElementById('reader');

    if (readerElement && readerElement.offsetWidth > 0 && readerElement.offsetHeight > 0) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250
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
      } else {
        console.log("data", data.data[0].time_in);
        const timeOutResponse = await axios.put(`${API_URL}/api/time_out/${data.data[0].attendance_id}`, {
          time_in: data.data[0].time_in
        });
        console.log(timeOutResponse.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (user && result) {
      timer = setTimeout(() => {
        // Reset user and result here
        setUser(null);
        setResult(null);
        window.location.reload()
      }, 5000); // 5000 milliseconds = 5 seconds
    }

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [user, result]);

  return (
    <div className="grid w-full min-h-screen grid-cols-1 ">

      <div className="flex flex-col items-center justify-center bg-muted/50">
        {user !== null &&
          <div>
            <Image width={300} height={300} src={user.qrcode} alt={user.name} />
            <h1 className="mt-3 text-xl font-semibold tracking-tight border-b scroll-m-20 first:mt-0">{user.name}</h1>
            <div className="flex gap-2">
              <Badge>{user.department}</Badge>
              <Badge >{user.position}</Badge>
            </div>
            <h2 className="mt-1 text-xs font-medium text-gray-300">Phone:{user.phone_number}</h2>
            <Button onClick={() => {
              setUser(null)
              setResult(null)
              window.location.reload()
            }}>Reset</Button>
          </div>}
        <div id="reader" className="w-[300px] h-[300px] border-0"></div>
      </div>
    </div>
  )
}
