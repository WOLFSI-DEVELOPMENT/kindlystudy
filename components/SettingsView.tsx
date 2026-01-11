
import React, { useState, useEffect } from 'react';
import { Save, Key, Check, AlertCircle } from 'lucide-react';
import { setStoredApiKey, getApiKey } from '../services/gemini';

export const SettingsView = () => {
    const [key, setKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const current = getApiKey();
        // Don't show the env key in the input field for security/clarity, 
        // unless it was manually overridden in local storage
        if(current && current !== process.env.API_KEY) {
            setKey(current);
        }
    }, []);

    const handleSave = () => {
        setStoredApiKey(key);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="w-full h-full bg-[#Fcfcfc] overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-12">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Settings</h1>
                
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Key size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gemini API Key</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                To use the AI features like Study Guides, Search, and Slide Generation, you need a Google Gemini API key. 
                                <br/>
                                You can get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a>.
                            </p>
                            
                            <div className="flex gap-3 mb-3">
                                <input 
                                    type="password" 
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="Paste your API key here (AIza...)"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                />
                                <button 
                                    onClick={handleSave}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${saved ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800 hover:scale-105'}`}
                                >
                                    {saved ? <Check size={18} /> : <Save size={18} />}
                                    {saved ? 'Saved' : 'Save Key'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <AlertCircle size={12} />
                                <span>Your key is stored locally in your browser and never sent to our servers (other than Google's API).</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm opacity-60 pointer-events-none grayscale">
                    <div className="flex items-start gap-5">
                         <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        </div>
                         <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Account & Billing</h3>
                            <p className="text-gray-500">Manage your subscription and billing details.</p>
                         </div>
                         <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">Coming Soon</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
