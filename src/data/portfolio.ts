import type { PortfolioProject } from '@/types';

export const portfolio: PortfolioProject[] = [
  {
    id: 'nutrifit',
    titleRu: 'NutriFit — платформа здоровья',
    titleEn: 'NutriFit — Digital Health Platform',
    descriptionRu: 'Цифровая платформа здоровья: питание, сон, активность, показатели тела и лабораторные анализы в одном месте',
    descriptionEn: 'A digital health platform bringing nutrition, sleep, activity, body metrics and lab tests together in one place',
    image: '/images/portfolio/nutrifit.png',
    tags: ['HealthTech', 'Web App', 'Analytics', 'Apple Health'],
    url: 'https://nutrifit.health',
  },
  {
    id: 'mendoza-travel',
    titleRu: 'GuruTom Travel — путешествия в Мендосе',
    titleEn: 'GuruTom Travel — Mendoza Travel Agency',
    descriptionRu: 'Премиальное туристическое агентство в Мендосе: винные туры, поездки в Анды, отели, трансферы и индивидуальные маршруты',
    descriptionEn: 'A premium travel agency in Mendoza offering winery tours, Andes adventures, accommodation, transfers and custom itineraries',
    image: '/images/portfolio/mendoza-travel-promo.png',
    tags: ['Travel', 'Mendoza', 'Concierge', 'Custom Trips'],
    url: 'https://mendoza.top/',
  },
  {
    id: 'wupaco-telegram-bot',
    titleRu: 'WuPaco — Telegram-бот',
    titleEn: 'WuPaco — Telegram Bot',
    descriptionRu: 'Telegram-бот для объявлений, реферальной системы, чатов, анкет и продвижения внутри сообщества WuPaco',
    descriptionEn: 'A Telegram bot for listings, referrals, chats, profiles and community promotion inside the WuPaco ecosystem',
    image: '/images/portfolio/wupaco-bot.png',
    tags: ['Telegram Bot', 'Community', 'Referrals', 'Advertising'],
    url: 'https://wupaco.com',
  },
  {
    id: 'governance-edo',
    titleRu: 'Governance — электронный документооборот',
    titleEn: 'Governance — Document Management',
    descriptionRu: 'Корпоративная система электронного документооборота: документы, согласования, версии, цифровые подписи, поиск и архив.',
    descriptionEn: 'An enterprise document management system for documents, approvals, versions, digital signatures, search and archiving.',
    image: '/images/portfolio/governance-ui.png',
    tags: ['EDMS', 'Approvals', 'Digital Signatures', 'Audit Trail'],
  },
];
