import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    ChevronRight,
    Wifi,
    WifiOff,
    Search,
    Filter,
    Plus,
    Settings,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    Badge,
    Button,
    SearchInput,
    StatusBadge,
    HealthBadge,
} from '../components/ui';
import { sites, devices } from '../data/mockData';

export function Sites() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSite, setExpandedSite] = useState<string | null>(null);

    const filteredSites = sites.filter(
        (site) =>
            site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSiteDevices = (siteId: string) =>
        devices.filter((device) => device.siteId === siteId);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 max-w-md">
                    <SearchInput
                        placeholder="Search sites or cities..."
                        onSearch={setSearchQuery}
                    />
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                        Filter
                    </Button>
                    <Button icon={<Plus className="w-4 h-4" />}>Add Site</Button>
                </div>
            </div>

            {/* Sites Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSites.map((site) => {
                    const siteDevices = getSiteDevices(site.id);
                    const isExpanded = expandedSite === site.id;

                    return (
                        <Card key={site.id} className="overflow-hidden">
                            <div
                                className="cursor-pointer"
                                onClick={() => setExpandedSite(isExpanded ? null : site.id)}
                            >
                                <CardBody>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 dark:border dark:border-slate-700/50 rounded-xl">
                                                <MapPin className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    {site.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {site.address}, {site.city}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Wifi className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {site.onlineDevices}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <WifiOff className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {site.deviceCount - site.onlineDevices}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-slate-400">
                                                        / {site.deviceCount} total
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={
                                                    site.status === 'active'
                                                        ? 'success'
                                                        : site.status === 'maintenance'
                                                            ? 'warning'
                                                            : 'neutral'
                                                }
                                            >
                                                {site.status}
                                            </Badge>
                                            <ChevronRight
                                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </div>

                            {/* Expanded Devices List */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Devices ({siteDevices.length})
                                        </h4>
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {siteDevices.slice(0, 4).map((device) => (
                                            <div
                                                key={device.id}
                                                onClick={() => navigate(`/sites/device/${device.id}`)}
                                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-transparent dark:border-slate-700/30 hover:shadow-sm cursor-pointer transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {device.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {device.type.toUpperCase()} • {device.ipAddress}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <HealthBadge health={device.health} />
                                                    <StatusBadge status={device.status} />
                                                </div>
                                            </div>
                                        ))}
                                        {siteDevices.length > 4 && (
                                            <p className="text-center text-sm text-slate-500 py-2">
                                                +{siteDevices.length - 4} more devices
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {filteredSites.length === 0 && (
                <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No sites found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Try adjusting your search criteria
                    </p>
                </div>
            )}
        </div>
    );
}
