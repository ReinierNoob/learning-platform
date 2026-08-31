const token = process.env.VERCEL_OIDC_TOKEN;
const target = "https://learning-platform-jkh4k0tr1-reiniernoobs-projects.vercel.app";

if (!token) {
  console.error("OIDC_TRUSTED_SOURCE_PROBE:NO_TOKEN");
  process.exit(23);
}

async function request(path) {
  const response = await fetch(`${target}${path}`, {
    headers: {
      "x-vercel-trusted-oidc-idp-token": token,
    },
    redirect: "manual",
  });
  const location = response.headers.get("location") ?? "";
  const locationClass = location.includes("vercel.com/sso-api")
    ? "vercel_sso"
    : location.includes("enterprisearchitectureworks.nl/account/inloggen")
      ? "eaw_login"
      : location
        ? "other_redirect"
        : "none";
  console.log(`OIDC_TRUSTED_SOURCE_PROBE:${JSON.stringify({ path, status: response.status, locationClass })}`);
  return { response, location, locationClass };
}

const lab = await request("/lab/solution-architecture-module-6");
if (lab.response.status !== 200 || lab.locationClass === "vercel_sso") {
  console.error("OIDC_TRUSTED_SOURCE_PROBE:LAB_FAILED");
  process.exit(24);
}

const learning = await request("/leren/solution-architectuur-ontwerppraktijk/module/6");
if (learning.response.status < 300 || learning.response.status >= 400 || learning.locationClass !== "eaw_login") {
  console.error("OIDC_TRUSTED_SOURCE_PROBE:LEARNING_ROUTE_FAILED");
  process.exit(25);
}

console.log("OIDC_TRUSTED_SOURCE_PROBE:PASS");
