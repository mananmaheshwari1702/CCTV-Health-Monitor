import React, { useState } from 'react';
import { Save, Bell, Shield, Database, Globe, Mail, Smartphone, Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select } from '../components/ui';

export function Settings() {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* General Settings */}
            <Card>
                <CardHeader>General Settings</CardHeader>
                <CardBody>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Organization Name" defaultValue="ACME Corporation" />
                            <Input label="System Email" type="email" defaultValue="admin@acme.com" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Timezone" options={[
                                { value: 'UTC', label: 'UTC' },
                                { value: 'EST', label: 'Eastern Time (EST)' },
                                { value: 'PST', label: 'Pacific Time (PST)' },
                                { value: 'IST', label: 'India Standard Time (IST)' },
                            ]} defaultValue="EST" />
                            <Select label="Date Format" options={[
                                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                            ]} defaultValue="MM/DD/YYYY" />
                        </div>
                    </div>
                </CardBody>
                <CardFooter>
                    <Button icon={<Save className="w-4 h-4" />}>Save Changes</Button>
                </CardFooter>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>Notification Preferences</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {[
                            { icon: Bell, title: 'Device Offline Alerts', desc: 'Receive alerts when devices go offline', enabled: true },
                            { icon: Shield, title: 'Security Alerts', desc: 'Critical security notifications', enabled: true },
                            { icon: Database, title: 'Storage Warnings', desc: 'Low storage capacity warnings', enabled: true },
                            { icon: Mail, title: 'Daily Report Email', desc: 'Receive daily summary via email', enabled: false },
                            { icon: Smartphone, title: 'Mobile Push Notifications', desc: 'Push notifications to mobile app', enabled: false },
                        ].map((item) => (
                            <div key={item.title} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm"><item.icon className="w-5 h-5 text-slate-600" /></div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.title}</p>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                </label>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>Appearance</CardHeader>
                <CardBody>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">{darkMode ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-500" />}</div>
                            <div>
                                <p className="font-medium text-slate-900">Dark Mode</p>
                                <p className="text-sm text-slate-500">Toggle dark mode theme</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                    </div>
                </CardBody>
            </Card>

            {/* System Configuration */}
            <Card>
                <CardHeader>System Configuration</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Health Check Interval (minutes)" type="number" defaultValue="5" />
                        <Input label="Session Timeout (minutes)" type="number" defaultValue="30" />
                        <Input label="Max Recording Gap (minutes)" type="number" defaultValue="15" />
                        <Input label="Alert Threshold (%)" type="number" defaultValue="85" />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="flex gap-3">
                        <Button icon={<Save className="w-4 h-4" />}>Save Configuration</Button>
                        <Button variant="outline">Reset to Defaults</Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Integrations */}
            <Card>
                <CardHeader>Integrations</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: 'Slack', status: 'Connected', color: 'emerald' },
                            { name: 'Email SMTP', status: 'Connected', color: 'emerald' },
                            { name: 'PagerDuty', status: 'Not Connected', color: 'slate' },
                        ].map((int) => (
                            <div key={int.name} className="p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-slate-900">{int.name}</h4>
                                    <span className={`w-2 h-2 rounded-full ${int.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{int.status}</p>
                                <Button variant="outline" size="sm" fullWidth>Configure</Button>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
