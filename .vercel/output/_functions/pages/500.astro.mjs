import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C8XUooFx.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CLBZbsYb.mjs';
export { renderers } from '../renderers.mjs';

const $$500 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-3xl mx-auto px-4 py-16 text-center"> <h1 class="text-4xl font-bold mb-4">500 — Server error</h1> <p class="text-gray-600 mb-8">Sorry, something went wrong. Please try again later.</p> <a href="/" class="text-blue-600 underline">Go home</a> </main> ` })}`;
}, "/Users/andrewharvey/dev/ai-playground/src/pages/500.astro", void 0);

const $$file = "/Users/andrewharvey/dev/ai-playground/src/pages/500.astro";
const $$url = "/500";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$500,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
