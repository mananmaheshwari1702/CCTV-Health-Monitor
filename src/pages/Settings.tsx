import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Database, Globe, Mail, Smartphone, Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../context/DataContext';

export function Settings() {
    const { theme, setTheme, isDark } = useTheme();
    const { settings, updateSettings } = useData();

    // Local state for form handling to avoid jitter, sync on mount
    const [formData, setFormData] = useState(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (section: keyof typeof settings, field: string, value: any) => {
        setFormData(prev => {
            if (section === 'notifications' || section === 'system') {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section as 'notifications' | 'system'],
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleSave = () => {
        updateSettings(formData);
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* General Settings */}
            <Card>
                <CardHeader>General Settings</CardHeader>
                <CardBody>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Organization Name"
                                value={formData.organizationName}
                                onChange={(e) => handleChange('organizationName' as any, 'organizationName', e.target.value)}
                            />
                            <Input
                                label="System Email"
                                type="email"
                                value={formData.systemEmail}
                                onChange={(e) => handleChange('systemEmail' as any, 'systemEmail', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Timezone"
                                options={[
                                    { value: 'UTC', label: 'UTC' },
                                    { value: 'EST', label: 'Eastern Time (EST)' },
                                    { value: 'PST', label: 'Pacific Time (PST)' },
                                    { value: 'IST', label: 'India Standard Time (IST)' },
                                ]}
                                value={formData.timezone}
                                onChange={(e) => handleChange('timezone' as any, 'timezone', e.target.value)}
                            />
                            <Select
                                label="Date Format"
                                options={[
                                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                                ]}
                                value={formData.dateFormat}
                                onChange={(e) => handleChange('dateFormat' as any, 'dateFormat', e.target.value)}
                            />
                        </div>
                    </div>
                </CardBody>
                <CardFooter>
                    <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>Notification Preferences</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {[
                            { id: 'deviceOffline', icon: Bell, title: 'Device Offline Alerts', desc: 'Receive alerts when devices go offline' },
                            { id: 'securityAlerts', icon: Shield, title: 'Security Alerts', desc: 'Critical security notifications' },
                            { id: 'storageWarnings', icon: Database, title: 'Storage Warnings', desc: 'Low storage capacity warnings' },
                            { id: 'dailyReports', icon: Mail, title: 'Daily Report Email', desc: 'Receive daily summary via email' },
                            { id: 'mobilePush', icon: Smartphone, title: 'Mobile Push Notifications', desc: 'Push notifications to mobile app' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><item.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" /></div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-300">{item.desc}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.notifications[item.id as keyof typeof formData.notifications]}
                                        onChange={(e) => handleChange('notifications', item.id, e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
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
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                {theme === 'dark' || (theme === 'system' && isDark) ? (
                                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                ) : (
                                    <Sun className="w-5 h-5 text-amber-500" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Theme Preference</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">Choose your preferred appearance</p>
                            </div>
                        </div>
                        <div className="w-48">
                            <Select
                                options={[
                                    { value: 'light', label: 'Light Mode' },
                                    { value: 'dark', label: 'Dark Mode' },
                                    { value: 'system', label: 'System Default' },
                                ]}
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as any)}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* System Configuration */}
            <Card>
                <CardHeader>System Configuration</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Health Check Interval (minutes)"
                            type="number"
                            value={formData.system.healthCheckInterval}
                            onChange={(e) => handleChange('system', 'healthCheckInterval', parseInt(e.target.value))}
                        />
                        <Input
                            label="Session Timeout (minutes)"
                            type="number"
                            value={formData.system.sessionTimeout}
                            onChange={(e) => handleChange('system', 'sessionTimeout', parseInt(e.target.value))}
                        />
                        <Input
                            label="Max Recording Gap (minutes)"
                            type="number"
                            value={formData.system.maxRecordingGap}
                            onChange={(e) => handleChange('system', 'maxRecordingGap', parseInt(e.target.value))}
                        />
                        <Input
                            label="Alert Threshold (%)"
                            type="number"
                            value={formData.system.alertThreshold}
                            onChange={(e) => handleChange('system', 'alertThreshold', parseInt(e.target.value))}
                        />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="flex gap-3">
                        <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save Configuration</Button>
                        <Button variant="outline" onClick={() => setFormData(settings)}>Reset to Defaults</Button>
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
                            <div key={int.name} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-slate-900 dark:text-white">{int.name}</h4>
                                    <span className={`w-2 h-2 rounded-full ${int.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{int.status}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    onClick={() => alert(`Configure ${int.name} integration...`)}
                                >
                                    Configure
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
