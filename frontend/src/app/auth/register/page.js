// src/app/auth/login/page.js
'use client'

import {FcGoogle} from 'react-icons/fc'
import {Lock, Mail, User} from 'lucide-react'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import axios from 'axios'
import Image from "next/image";
import registerImage from "./regsiter.jpg";


export default function RegisterPage() {

    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        termsAccepted: false,
    })

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match')
            return
        }
        if (!formData.termsAccepted) {
            alert('You must accept the terms and conditions')
            return
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })
            alert('Registration successful! Please log in.')
            router.push('/auth/login')
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#D4D5EE] px-4">
            <div className="bg-white shadow-lg rounded-lg flex w-full max-w-4xl overflow-hidden">
                {/* Left illustration area */}
                <div className="hidden md:flex relative w-1/2 h-[600px]"> {/* Set fixed height */}
                    {/* Background Image using `fill` */}
                    <Image
                        src={registerImage}
                        alt="Team Work"
                        fill
                        className=" object-contain rounded-lg "
                        priority
                    />

                    {/* Overlay content */}
                    <div
                        className="absolute  rounded-lg flex flex-col justify-center items-center text-center text-blue-900 p-10 z-10">
                        <h2 className="text-3xl text-center font-extrabold mb-2">TrackMate</h2>
                        <div className='text-center mt-96  py-8'>
                            <h3 className="text-2xl font-semibold">Project Management Service</h3>
                            <p className="text-lg mt-2 max-w-md">Everything you need for convenient team work</p>
                        </div>

                    </div>
                </div>


                {/* Login form area */}
                <div
                    className="w-full md:w-1/2 p-8 bg-[#D4D5EE] border-blue-500 hover:border-r hover:border-b rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign Up </h2>

                    <form className="space-y-4 " onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                type="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <User className="absolute left-3 top-3 text-gray-600" size={20}/>
                        </div>

                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="example@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Mail className="absolute left-3 top-3 text-gray-600" size={20}/>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Lock className="absolute left-3 top-3 text-gray-600" size={20}/>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Lock className="absolute left-3 top-3 text-gray-600" size={20}/>
                        </div>


                        <div className="flex items-center text-sm text-blue-600 hover:underline">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label>I agree to the Terms and Conditions</label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#3667B1] text-white py-3 rounded-md hover:bg-blue-700 transition font-bold"
                        >
                            Register
                        </button>
                    </form>

                    <div className="mt-2 text-center text-sm text-gray-500">Or</div>

                    <div
                        className="flex justify-center gap-4 mt-4 py-2.5 px-4 border rounded-md bg-[#f8f8f8] shadow-md cursor-pointer hover:bg-gray-100 transition">

                        <FcGoogle className="text-xl cursor-pointer"/>
                        Continue with Google
                    </div>

                    <div className="mt-6 text-center text-sm">
                        Already have an account?{' '}
                        <a href="/auth/login" className="text-blue-600 hover:underline">
                            Let&apos;s Sign in!
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
