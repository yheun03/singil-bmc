import { parseAllGameHtmlFiles } from './parse-game-html.js';
import { buildAllRecords } from './build-records.js';

function main() {
    console.log('=== records:update ===');

    const games = parseAllGameHtmlFiles();
    const result = buildAllRecords();

    console.log('');
    console.log('기록 갱신 완료');
    console.log(`- 파싱된 경기: ${games.length}개`);
    console.log(`- summary 타자: ${result.battingPlayers}명`);
    console.log(`- summary 투수: ${result.pitchingPlayers}명`);
}

main();
