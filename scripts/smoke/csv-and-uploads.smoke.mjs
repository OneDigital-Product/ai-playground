#!/usr/bin/env node
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\/$/, '');
if (!base) {
  console.error('ERROR: NEXT_PUBLIC_CONVEX_URL is not set');
  process.exit(1);
}

async function checkCsv() {
  const url = `${base}/enrollment/dashboard.csv`;
  const res = await fetch(url, { method: 'GET' });
  const ok = res.status === 200 && (res.headers.get('content-type') || '').includes('text/csv');
  console.log(`CSV GET ${url} -> ${res.status} ${ok ? 'OK' : 'Unexpected'}`);
  return ok;
}

async function checkDownloadNotFound() {
  const badId = 'nonexistent';
  const url = `${base}/enrollment/uploads/download?id=${badId}`;
  const res = await fetch(url, { method: 'GET', redirect: 'manual' });
  const ok = res.status === 404;
  console.log(`Download GET ${url} -> ${res.status} ${ok ? 'OK' : 'Unexpected'}`);
  return ok;
}

async function checkDeleteNotFound() {
  const badId = 'nonexistent';
  const url = `${base}/enrollment/uploads?id=${badId}`;
  const res = await fetch(url, { method: 'DELETE' });
  const ok = res.status === 404;
  console.log(`Delete DELETE ${url} -> ${res.status} ${ok ? 'OK' : 'Unexpected'}`);
  return ok;
}

(async () => {
  const results = [];
  results.push(await checkCsv());
  // small delay to avoid rate limits in certain environments
  await sleep(100);
  results.push(await checkDownloadNotFound());
  await sleep(100);
  results.push(await checkDeleteNotFound());

  const allOk = results.every(Boolean);
  if (!allOk) process.exit(2);
})();

