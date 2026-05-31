import { parseAllGameHtmlFiles } from './parse-game-html.js';
import { buildAllRecords } from './build-records.js';
import {
    GAMES_DIR,
    SUMMARY_DIR,
    GENERATED_DIR,
    MANUAL_DIR,
    ensureDir,
    resetDir,
    writeJson,
    readJson,
} from './lib/records-utils.js';
import path from 'path';

function prepareGeneratedData() {
    resetDir(GAMES_DIR);
    resetDir(SUMMARY_DIR);
    resetDir(GENERATED_DIR);
    ensureDir(MANUAL_DIR);

    const youtubeLinksPath = path.join(MANUAL_DIR, 'youtube-links.json');
    if (!readJson(youtubeLinksPath, null)) {
        writeJson(youtubeLinksPath, {});
    }
}

function main() {
    console.log('=== records:update ===');

    prepareGeneratedData();
    const games = parseAllGameHtmlFiles();
    const result = buildAllRecords();

    console.log('');
    console.log('기록 갱신 완료');
    console.log(`- 파싱된 경기: ${games.length}개`);
    console.log(`- summary 타자: ${result.battingPlayers}명`);
    console.log(`- summary 투수: ${result.pitchingPlayers}명`);
}

main();
