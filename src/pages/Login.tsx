import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock authentication
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (email && password) {
            navigate('/dashboard');
        } else {
            setError('Please enter your email and password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 flex-col justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">CCTV Monitor</h1>
                        <p className="text-sm text-blue-300">Health Dashboard</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Enterprise-grade CCTV<br />
                        <span className="text-blue-400">Health Monitoring</span>
                    </h2>
                    <p className="text-lg text-slate-300 max-w-md">
                        Monitor device health, manage tickets, and ensure your surveillance
                        infrastructure runs smoothly 24/7.
                    </p>
                    <div className="flex gap-8">
                        <div>
                            <p className="text-3xl font-bold text-white">248+</p>
                            <p className="text-sm text-slate-400">Devices Monitored</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">99.5%</p>
                            <p className="text-sm text-slate-400">Uptime</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">5</p>
                            <p className="text-sm text-slate-400">Sites</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-500">
                    © 2026 CCTV Health Monitor. All rights reserved.
                </p>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">CCTV Monitor</h1>
                            <p className="text-sm text-slate-500">Health Dashboard</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                            <p className="text-slate-500 mt-2">Sign in to your account</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@company.com"
                                        className="w-full pl-12 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                            >
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500">
                                Demo credentials: any email + password
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
