import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { Save, Key, MessageSquare, Mail, Send, Shield, Eye, EyeOff } from 'lucide-react';

interface Setting {
    setting_key: string;
    setting_value: string;
    setting_category: string;
    description: string;
}

export const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

    // Auth Settings
    const [authSettings, setAuthSettings] = useState({
        jwt_secret: '',
        jwt_expiry: '7d',
        session_timeout: '30',
    });

    // WhatsApp Settings
    const [whatsappSettings, setWhatsappSettings] = useState({
        whatsapp_provider: 'twilio',
        whatsapp_api_key: '',
        whatsapp_account_sid: '',
        whatsapp_phone_number: '',
        whatsapp_business_id: '',
    });

    // SMS Settings
    const [smsSettings, setSmsSettings] = useState({
        sms_api_key: '',
        sms_sender_id: '',
        sms_provider: 'twilio',
    });

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        email_from: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const allSettings = await settingsService.getAll();

            // Parse settings by category
            allSettings.forEach((setting: any) => {
                const key = setting.setting_key;
                const value = setting.setting_value || '';

                if (setting.setting_category === 'auth') {
                    setAuthSettings(prev => ({ ...prev, [key]: value }));
                } else if (setting.setting_category === 'whatsapp') {
                    setWhatsappSettings(prev => ({ ...prev, [key]: value }));
                } else if (setting.setting_category === 'sms') {
                    setSmsSettings(prev => ({ ...prev, [key]: value }));
                } else if (setting.setting_category === 'email') {
                    setEmailSettings(prev => ({ ...prev, [key]: value }));
                }
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const allSettings: Setting[] = [
                // Auth
                { setting_key: 'jwt_secret', setting_value: authSettings.jwt_secret, setting_category: 'auth', description: 'JWT Secret Key' },
                { setting_key: 'jwt_expiry', setting_value: authSettings.jwt_expiry, setting_category: 'auth', description: 'JWT Token Expiry' },
                { setting_key: 'session_timeout', setting_value: authSettings.session_timeout, setting_category: 'auth', description: 'Session Timeout (minutes)' },

                // WhatsApp
                { setting_key: 'whatsapp_provider', setting_value: whatsappSettings.whatsapp_provider, setting_category: 'whatsapp', description: 'WhatsApp Provider' },
                { setting_key: 'whatsapp_api_key', setting_value: whatsappSettings.whatsapp_api_key, setting_category: 'whatsapp', description: 'WhatsApp API Key / Auth Token' },
                { setting_key: 'whatsapp_account_sid', setting_value: whatsappSettings.whatsapp_account_sid, setting_category: 'whatsapp', description: 'Twilio Account SID' },
                { setting_key: 'whatsapp_phone_number', setting_value: whatsappSettings.whatsapp_phone_number, setting_category: 'whatsapp', description: 'WhatsApp Phone Number' },
                { setting_key: 'whatsapp_business_id', setting_value: whatsappSettings.whatsapp_business_id, setting_category: 'whatsapp', description: 'WhatsApp Business ID (Meta only)' },

                // SMS
                { setting_key: 'sms_api_key', setting_value: smsSettings.sms_api_key, setting_category: 'sms', description: 'SMS API Key' },
                { setting_key: 'sms_sender_id', setting_value: smsSettings.sms_sender_id, setting_category: 'sms', description: 'SMS Sender ID' },
                { setting_key: 'sms_provider', setting_value: smsSettings.sms_provider, setting_category: 'sms', description: 'SMS Provider' },

                // Email
                { setting_key: 'smtp_host', setting_value: emailSettings.smtp_host, setting_category: 'email', description: 'SMTP Host' },
                { setting_key: 'smtp_port', setting_value: emailSettings.smtp_port, setting_category: 'email', description: 'SMTP Port' },
                { setting_key: 'smtp_user', setting_value: emailSettings.smtp_user, setting_category: 'email', description: 'SMTP Username' },
                { setting_key: 'smtp_password', setting_value: emailSettings.smtp_password, setting_category: 'email', description: 'SMTP Password' },
                { setting_key: 'email_from', setting_value: emailSettings.email_from, setting_category: 'email', description: 'From Email Address' },
            ];

            await settingsService.bulkUpdate(allSettings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const togglePasswordVisibility = (key: string) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500">Configure API keys and system integrations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Authentication Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Authentication</h2>
                            <p className="text-xs text-gray-500">JWT and session configuration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Secret Key</label>
                            <div className="relative">
                                <input
                                    type={showPasswords['jwt_secret'] ? 'text' : 'password'}
                                    value={authSettings.jwt_secret}
                                    onChange={(e) => setAuthSettings({ ...authSettings, jwt_secret: e.target.value })}
                                    className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter JWT secret key"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('jwt_secret')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords['jwt_secret'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token Expiry</label>
                            <input
                                type="text"
                                value={authSettings.jwt_expiry}
                                onChange={(e) => setAuthSettings({ ...authSettings, jwt_expiry: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., 7d, 24h"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={authSettings.session_timeout}
                                onChange={(e) => setAuthSettings({ ...authSettings, session_timeout: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="30"
                            />
                        </div>
                    </div>
                </div>

                {/* WhatsApp Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">WhatsApp Integration</h2>
                            <p className="text-xs text-gray-500">Configure Twilio or Meta WhatsApp API</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                            <select
                                value={whatsappSettings.whatsapp_provider}
                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_provider: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="twilio">Twilio (Sandbox & Production)</option>
                                <option value="meta">Meta WhatsApp Business API</option>
                            </select>
                        </div>

                        {whatsappSettings.whatsapp_provider === 'twilio' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                                    <input
                                        type="text"
                                        value={whatsappSettings.whatsapp_account_sid}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_account_sid: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords['whatsapp_api_key'] ? 'text' : 'password'}
                                            value={whatsappSettings.whatsapp_api_key}
                                            onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_api_key: e.target.value })}
                                            className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Your Twilio Auth Token"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('whatsapp_api_key')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords['whatsapp_api_key'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">From Number (Sandbox)</label>
                                    <input
                                        type="text"
                                        value={whatsappSettings.whatsapp_phone_number}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_phone_number: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="whatsapp:+14155238886"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">For sandbox: whatsapp:+14155238886</p>
                                </div>
                            </>
                        )}

                        {whatsappSettings.whatsapp_provider === 'meta' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Access Token)</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords['whatsapp_api_key'] ? 'text' : 'password'}
                                            value={whatsappSettings.whatsapp_api_key}
                                            onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_api_key: e.target.value })}
                                            className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Enter WhatsApp API key"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('whatsapp_api_key')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords['whatsapp_api_key'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        value={whatsappSettings.whatsapp_phone_number}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_phone_number: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="+91 9876543210"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business ID (Phone Number ID)</label>
                                    <input
                                        type="text"
                                        value={whatsappSettings.whatsapp_business_id}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_business_id: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="WhatsApp Business Account ID"
                                    />
                                </div>
                            </>
                        )}

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                            <p className="font-semibold mb-1">📱 Twilio Sandbox Setup:</p>
                            <p>1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message</p>
                            <p>2. Send "join [sandbox-name]" to the Twilio number from your WhatsApp</p>
                            <p>3. Use sandbox number: whatsapp:+14155238886</p>
                        </div>
                    </div>
                </div>

                {/* SMS Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Send size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">SMS Integration</h2>
                            <p className="text-xs text-gray-500">SMS gateway configuration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                            <select
                                value={smsSettings.sms_provider}
                                onChange={(e) => setSmsSettings({ ...smsSettings, sms_provider: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="twilio">Twilio</option>
                                <option value="msg91">MSG91</option>
                                <option value="textlocal">TextLocal</option>
                                <option value="aws_sns">AWS SNS</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                            <div className="relative">
                                <input
                                    type={showPasswords['sms_api_key'] ? 'text' : 'password'}
                                    value={smsSettings.sms_api_key}
                                    onChange={(e) => setSmsSettings({ ...smsSettings, sms_api_key: e.target.value })}
                                    className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter SMS API key"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('sms_api_key')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords['sms_api_key'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sender ID</label>
                            <input
                                type="text"
                                value={smsSettings.sms_sender_id}
                                onChange={(e) => setSmsSettings({ ...smsSettings, sms_sender_id: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="SIETCS"
                            />
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Email Configuration</h2>
                            <p className="text-xs text-gray-500">SMTP server settings</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                            <input
                                type="text"
                                value={emailSettings.smtp_host}
                                onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="smtp.gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                            <input
                                type="text"
                                value={emailSettings.smtp_port}
                                onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="587"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                            <input
                                type="text"
                                value={emailSettings.smtp_user}
                                onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="your-email@gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords['smtp_password'] ? 'text' : 'password'}
                                    value={emailSettings.smtp_password}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                                    className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="App password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('smtp_password')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords['smtp_password'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Email Address</label>
                            <input
                                type="email"
                                value={emailSettings.email_from}
                                onChange={(e) => setEmailSettings({ ...emailSettings, email_from: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="noreply@sietcse.edu"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <Key className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Security Notice</p>
                        <p>API keys and credentials are stored securely in the database. Ensure you keep these values confidential and rotate them periodically for enhanced security.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
