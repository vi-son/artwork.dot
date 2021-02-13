const BASE_URL_PRD = "https://mixing-senses.art/api";
const BASE_URL_DEV = "http://localhost:8888/api";

const BASE_URL =
  process.env.NODE_ENV === "production" ? BASE_URL_PRD : BASE_URL_PRD;

const headers = new Headers();
headers.append(
  "Authorization",
  "Basic aGFydmVzdGVyQG1peGluZy1zZW5zZXMuYXJ0OiViRnM0TXI1SmNyfW9YcjVScERSQE5EcHNgUHpUYg=="
);

function get(route) {
  return fetch(`${BASE_URL}/${route}`, {
    method: "GET",
    mode: "cors",
    cache: "default",
    headers: headers
  })
    .then(r => r.json())
    .then(json => json.data)
    .then(d => {
      return d;
    });
}

export { BASE_URL, get };
