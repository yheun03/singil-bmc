import type { SeoLocale } from '~/config/seo';

export type SeoPageDefaults = {
    title?: string;
    description: { ko: string; en?: string };
};

/** 정적 라우트별 기본 설명 (플러그인·useSeo에서 path로 조회) */
export const seoPageDefaults: Record<string, SeoPageDefaults> = {
    '/': {
        title: '홈',
        description: {
            ko: '신길교회 야구 선교단 공식 홈페이지. 시즌 기록 요약, 운영진 소개, 경기·MVP·영상·소식 바로가기.',
        },
    },
    '/about': {
        title: '선교단 소개',
        description: {
            ko: '신길교회 야구 선교단은 A·D 두 조로 활동하며, 야구를 통해 교제와 선교를 실천합니다.',
        },
    },
    '/about/leaders': {
        title: '조직/섬김이',
        description: {
            ko: '신길교회 야구 선교단 감독, 총무, 조별 운영진을 소개합니다.',
        },
    },
    '/about/history': {
        title: '히스토리',
        description: {
            ko: '신길교회 야구 선교단의 연혁과 주요 활동을 확인합니다.',
        },
    },
    '/players': {
        title: '선수',
        description: {
            ko: '신길교회 야구 선교단 등록 선수 명단과 포지션을 확인합니다.',
        },
    },
    '/players/batters': {
        title: '타자',
        description: {
            ko: '선교단 타자 명단과 타격 기록 요약을 확인합니다.',
        },
    },
    '/players/pitchers': {
        title: '투수',
        description: {
            ko: '선교단 투수 명단과 투구 기록 요약을 확인합니다.',
        },
    },
    '/games': {
        title: '경기',
        description: {
            ko: '신길교회 야구 선교단 경기 일정과 결과 목록을 확인합니다.',
        },
    },
    '/records': {
        title: '전체 기록',
        description: {
            ko: '타자·투수 누적 기록과 팀 시즌 통계를 확인합니다.',
        },
    },
    '/records/yearly': {
        title: '연도별 기록',
        description: {
            ko: '연도별 팀·선수 야구 기록을 확인합니다.',
        },
    },
    '/records/monthly': {
        title: '월별 기록',
        description: {
            ko: '월별 팀·선수 야구 기록을 확인합니다.',
        },
    },
    '/records/groups': {
        title: '조별 기록',
        description: {
            ko: 'A조·D조별 야구 기록을 확인합니다.',
        },
    },
    '/mvp': {
        title: 'MVP',
        description: {
            ko: '신길교회 야구 선교단 월별·주간 MVP 수상자를 확인합니다.',
        },
    },
    '/mvp/monthly': {
        title: '월별 MVP',
        description: {
            ko: '월별 MVP 수상 선수와 활약을 확인합니다.',
        },
    },
    '/mvp/weekly': {
        title: '주간 MVP',
        description: {
            ko: '주간 MVP 수상 선수와 활약을 확인합니다.',
        },
    },
    '/videos': {
        title: 'YouTube 영상',
        description: {
            ko: '다윗 야구 선교단 YouTube(David TV) 경기·행사 영상 모음.',
        },
    },
    '/gallery/team': {
        title: '단체사진',
        description: {
            ko: '경기와 행사 단체사진 갤러리를 확인합니다.',
        },
    },
    '/news': {
        title: '소식',
        description: {
            ko: '신길교회 야구 선교단 최신 소식과 공지를 확인합니다.',
        },
    },
    '/contact': {
        title: '문의',
        description: {
            ko: '선교단 참여 및 문의 연락처 안내.',
        },
    },
};

export function getSeoPageDefaults(path: string, locale: SeoLocale = 'ko'): { title?: string; description: string } {
    const entry = seoPageDefaults[path];
    if (!entry) {
        return { description: '' };
    }

    const description = entry.description[locale] ?? entry.description.ko;
    return { title: entry.title, description };
}
