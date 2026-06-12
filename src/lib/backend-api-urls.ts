import "server-only";

export function getFootballApiUrl(pathname: string) {
  return buildNamespacedApiUrl(
    requiredEnv(process.env.API_FOOTBALL_BASE_URL, "API_FOOTBALL_BASE_URL"),
    "soccer",
    pathname
  );
}

export function getDataApiUrl(pathname: string) {
  return buildNamespacedApiUrl(
    requiredEnv(process.env.API_DATA_BASE_URL, "API_DATA_BASE_URL"),
    "scorm",
    pathname
  );
}

function buildNamespacedApiUrl(
  configuredBaseUrl: string,
  namespace: "soccer" | "scorm",
  pathname: string
) {
  const url = new URL(configuredBaseUrl);
  const baseSegments = splitPath(url.pathname);
  const pathSegments = splitPath(pathname);

  while (baseSegments.at(-1)?.toLowerCase() === namespace) {
    baseSegments.pop();
  }
  while (pathSegments[0]?.toLowerCase() === namespace) {
    pathSegments.shift();
  }

  url.pathname = `/${[...baseSegments, namespace, ...pathSegments].join("/")}`;
  url.search = "";
  url.hash = "";
  return url;
}

function splitPath(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.`);
  }

  return value;
}
