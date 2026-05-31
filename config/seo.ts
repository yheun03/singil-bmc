import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

/**
 * 목표: 선교단 사이트 전역 SEO 메타와 구조화 데이터를 한곳에서 관리한다.
 * 기능: 기본 사이트 정보, 다국어 키워드, Organization/WebSite JSON-LD 원천 데이터를 제공한다.
 */
export type SeoLocale = 'ko' | 'en';

export const seoConfig = {
    siteUrl: 'https://yheun03.github.io/singil-bmc/',
    defaultOgImage: '/images/image_group.jpg',
    defaultOgImageSize: {
        width: 1200,
        height: 630,
    },
    siteName: '신길교회 야구 선교단',
    siteNameShort: 'SINGIL BMC',
    themeColor: '#1e56c8',
    organizationId: '#organization',
    websiteId: '#website',
    locale: 'ko_KR',
    twitterSite: '',
    sameAs: [YOUTUBE_CHANNEL_URL],
} as const;

export const seoKeywords = {
    ko: [
        '신길교회 야구 선교단',
        '신길교회 야구선교단',
        '다윗 야구 선교단',
        'Singil Baseball Mission',
        'SINGIL BMC',
        '교회 야구',
        '야구 선교',
        '야구 선교단',
        '게임원',
        '아마추어 야구',
        '야구 기록',
        '야구 통계',
        'MVP',
        '야구 영상',
        'David TV',
    ],
    en: [
        'Singil Church Baseball Mission',
        'SINGIL BMC',
        'church baseball',
        'baseball mission',
        'amateur baseball',
        'baseball stats',
        'MVP',
    ],
} satisfies Record<SeoLocale, string[]>;

export const seoStructuredData = {
    organization: {
        alternateName: ['Singil Church Baseball Mission', 'SINGIL BMC', '다윗 야구 선교단'],
        description: {
            ko: '신길교회 야구 선교단은 A·D 두 조로 활동하며, 야구를 통해 교제와 선교를 실천하는 공동체입니다. 경기 기록, MVP, 영상, 소식을 온라인으로 공유합니다.',
            en: 'Singil Church Baseball Mission is a community that practices fellowship and mission through baseball in A and D groups, sharing game records, MVP awards, videos, and news online.',
        },
    },
    website: {
        name: {
            ko: '신길교회 야구 선교단 공식 홈페이지',
            en: 'Singil Church Baseball Mission Official Website',
        },
        description: {
            ko: '경기 기록, 선수 명단, MVP, YouTube 영상, 단체사진, 구단 소식을 확인할 수 있는 신길교회 야구 선교단 홈페이지입니다.',
            en: 'Official site for game records, rosters, MVP, YouTube videos, team photos, and news from Singil Church Baseball Mission.',
        },
    },
} as const;

/** 크롤링 제외 경로 접두사 */
export const seoNoindexPrefixes = ['/demos', '/auth', '/workspace', '/settings'] as const;
