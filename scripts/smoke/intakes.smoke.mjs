#!/usr/bin/env node
import { setTimeout as sleep } from 'node:timers/promises';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@repo/backend/convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('ERROR: NEXT_PUBLIC_CONVEX_URL is not set');
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function createIntake() {
  const args = {
    clientName: 'Smoke Test Co.',
    planYear: 2025,
    requestorName: 'QA Bot',
    payrollStorageUrl: 'https://example.com/storage',
    guideType: 'Update Existing Guide',
    communicationsAddOns: ['OE Letter'],
    requestedProductionTime: 'Standard',
    notesGeneral: 'Created by smoke test',
    sectionsChangedFlags: {
      A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false,
    },
    sectionsIncludedFlags: {
      A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: true, J: true, K: true, L: true, M: true, N: true, O: true, P: true, Q: true,
    },
  };
  const res = await client.mutation(api.functions.intakes.create, args);
  if (!res?.intakeId) throw new Error('Missing intakeId');
  console.log('Created intake:', res.intakeId);
  return res.intakeId;
}

async function updateStatus(intakeId) {
  await client.mutation(api.functions.intakes.updateStatus, { intakeId, status: 'STARTED' });
  console.log('Updated status to STARTED');
}

async function upsertSection(intakeId) {
  const result = await client.mutation(api.functions.sections.upsert, {
    intakeId,
    sectionCode: 'A',
    payload: { change_description: 'Initial change description from smoke test' },
  });
  if (!result?._id) throw new Error('Upsert section failed');
  console.log('Upserted section A');
}

async function verify(intakeId) {
  const intake = await client.query(api.functions.intakes.get, { intakeId });
  if (!intake) throw new Error('Intake not found after creation');
  if (intake.status !== 'STARTED') throw new Error('Status did not persist');
  const sections = await client.query(api.functions.sections.getByIntake, { intakeId });
  const a = sections.find((s) => s.sectionCode === 'A');
  if (!a || !(a.payload && 'change_description' in a.payload)) throw new Error('Section A missing');
  console.log('Verified intake and section');
}

(async () => {
  try {
    const id = await createIntake();
    await sleep(50);
    await updateStatus(id);
    await sleep(50);
    await upsertSection(id);
    await sleep(50);
    await verify(id);
  } catch (err) {
    console.error('Smoke test failed:', err?.message || err);
    process.exit(2);
  }
})();

