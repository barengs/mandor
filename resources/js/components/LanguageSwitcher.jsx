import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-zinc-50">
                <Globe className="w-4 h-4" />
                <span>{i18n.language === 'id' ? 'ID' : 'EN'}</span>
            </button>
            <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover:block z-50">
                <div className="bg-white rounded-lg shadow-lg border border-zinc-100 overflow-hidden">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors ${i18n.language === 'en' ? 'text-orange-600 font-medium bg-orange-50' : 'text-zinc-600'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => changeLanguage('id')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors ${i18n.language === 'id' ? 'text-orange-600 font-medium bg-orange-50' : 'text-zinc-600'}`}
                    >
                        Indonesia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
