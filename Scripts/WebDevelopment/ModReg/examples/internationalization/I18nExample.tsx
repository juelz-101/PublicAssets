import React from 'react';
import { createI18n, setLocale, useTranslation } from '../../modules/internationalization/i18n';

// --- Configuration (usually done at app root) ---
createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {name}!',
      pageTitle: 'Internationalization Module',
      description: 'This example demonstrates how to use the i18n utility to switch languages in a React application.',
      switcherLabel: 'Change Language:',
      english: 'English',
      spanish: 'Spanish',
      japanese: 'Japanese',
    },
    es: {
      greeting: '¡Hola, {name}!',
      pageTitle: 'Módulo de Internacionalización',
      description: 'Este ejemplo demuestra cómo usar la utilidad i18n para cambiar de idioma en una aplicación de React.',
      switcherLabel: 'Cambiar Idioma:',
      english: 'Inglés',
      spanish: 'Español',
      japanese: 'Japonés',
    },
    ja: {
      greeting: 'こんにちは、{name}さん！',
      pageTitle: '国際化モジュール',
      description: 'この例では、i18nユーティリティを使用してReactアプリケーションの言語を切り替える方法を示します。',
      switcherLabel: '言語を変更する:',
      english: '英語',
      spanish: 'スペイン語',
      japanese: '日本語',
    }
  },
});
// --- End Configuration ---

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: React.ReactNode }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const LanguageSwitcher: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="p-4 bg-base-100/50 rounded-lg">
            <label className="block text-text-secondary mb-2">{t('switcherLabel')}</label>
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setLocale('en')} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition">
                    {t('english')}
                </button>
                <button onClick={() => setLocale('es')} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition">
                    {t('spanish')}
                </button>
                 <button onClick={() => setLocale('ja')} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition">
                    {t('japanese')}
                </button>
            </div>
        </div>
    );
};

const TranslatedContent: React.FC = () => {
    const { t, locale } = useTranslation();

    return (
        <div className="p-4 bg-base-100/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-text-primary">
                {t('greeting', { name: 'Cosmo' })}
            </p>
            <p className="text-sm text-text-secondary mt-2">
                (Current locale: <span className="font-mono text-neon-pink">{locale}</span>)
            </p>
        </div>
    );
};

const I18nExample: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            <FuturisticCard
                title={t('pageTitle')}
                description={t('description')}
            >
                <LanguageSwitcher />
                <TranslatedContent />
            </FuturisticCard>
        </div>
    );
};

export default I18nExample;
