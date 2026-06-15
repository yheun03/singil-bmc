/**
 * baseURL(/singil-bmc/) 없이 /_nuxt/ 로 들어오는 잘못된 요청을
 * SPA 라우터까지 넘기지 않고 조기에 404로 처리한다.
 */
export default defineEventHandler((event) => {
    setResponseStatus(event, 404);
    return null;
});
