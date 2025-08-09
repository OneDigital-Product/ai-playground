import 'kleur/colors';
import { o as decodeKey } from './chunks/astro/server_C8XUooFx.mjs';
import 'clsx';
import 'cookie';
import './chunks/astro-designed-error-pages_COOoUX0v.mjs';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_D1erk_Nk.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/andrewharvey/dev/ai-playground/","cacheDir":"file:///Users/andrewharvey/dev/ai-playground/node_modules/.astro/","outDir":"file:///Users/andrewharvey/dev/ai-playground/dist/","srcDir":"file:///Users/andrewharvey/dev/ai-playground/src/","publicDir":"file:///Users/andrewharvey/dev/ai-playground/public/","buildClientDir":"file:///Users/andrewharvey/dev/ai-playground/dist/client/","buildServerDir":"file:///Users/andrewharvey/dev/ai-playground/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/500","isIndex":false,"type":"page","pattern":"^\\/500\\/?$","segments":[[{"content":"500","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/500.astro","pathname":"/500","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/apps/[app]","isIndex":false,"type":"page","pattern":"^\\/apps\\/([^/]+?)\\/?$","segments":[[{"content":"apps","dynamic":false,"spread":false}],[{"content":"app","dynamic":true,"spread":false}]],"params":["app"],"component":"src/pages/apps/[app].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/auth/reset","isIndex":false,"type":"page","pattern":"^\\/auth\\/reset\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"reset","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/reset.astro","pathname":"/auth/reset","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/auth/signin","isIndex":false,"type":"page","pattern":"^\\/auth\\/signin\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"signin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/signin.astro","pathname":"/auth/signin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_app_.Bz7LgWQD.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/andrewharvey/dev/ai-playground/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/Users/andrewharvey/dev/ai-playground/src/pages/500.astro",{"propagation":"none","containsHead":true}],["/Users/andrewharvey/dev/ai-playground/src/pages/apps/[app].astro",{"propagation":"none","containsHead":true}],["/Users/andrewharvey/dev/ai-playground/src/pages/auth/reset.astro",{"propagation":"none","containsHead":true}],["/Users/andrewharvey/dev/ai-playground/src/pages/auth/signin.astro",{"propagation":"none","containsHead":true}],["/Users/andrewharvey/dev/ai-playground/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/500@_@astro":"pages/500.astro.mjs","\u0000@astro-page:src/pages/apps/[app]@_@astro":"pages/apps/_app_.astro.mjs","\u0000@astro-page:src/pages/auth/reset@_@astro":"pages/auth/reset.astro.mjs","\u0000@astro-page:src/pages/auth/signin@_@astro":"pages/auth/signin.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DUe7nM6-.mjs","/Users/andrewharvey/dev/ai-playground/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DhnbY8Xo.mjs","/Users/andrewharvey/dev/ai-playground/src/components/islands/AppResolver.tsx":"_astro/AppResolver.Cf7g_3ha.js","@/components/islands/AuthChangePassword":"_astro/AuthChangePassword.BMoDPutA.js","/Users/andrewharvey/dev/ai-playground/src/components/islands/AuthSignIn.tsx":"_astro/AuthSignIn.CHpBUI5Q.js","/Users/andrewharvey/dev/ai-playground/src/components/islands/AppsList.tsx":"_astro/AppsList.DjtvLRlu.js","/Users/andrewharvey/dev/ai-playground/src/components/islands/AuthStatus.tsx":"_astro/AuthStatus.blUzadgU.js","@astrojs/react/client.js":"_astro/client.FTIDmp2Q.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_app_.Bz7LgWQD.css","/favicon.svg","/_astro/AppResolver.Cf7g_3ha.js","/_astro/AppsList.DjtvLRlu.js","/_astro/AuthChangePassword.BMoDPutA.js","/_astro/AuthSignIn.CHpBUI5Q.js","/_astro/AuthStatus.blUzadgU.js","/_astro/ErrorBoundary.CguKR82e.js","/_astro/api.CYROLObq.js","/_astro/client.FTIDmp2Q.js","/_astro/index.DtoOFyvK.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"rMnQmu6FJzzy7Dq9qXOZRtUBKi+QXEmFec3Pe7vezvs="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
