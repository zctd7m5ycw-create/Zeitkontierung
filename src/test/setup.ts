/**
 * Wird vor jeder Testdatei ausgeführt.
 */
import 'fake-indexeddb/auto'; // simulierte IndexedDB für Node
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { db } from '@/data/db';

// jsdom kennt die Dialog-Methoden noch nicht: einfache Nachbildung für Tests.
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
  this.removeAttribute('open');
};

beforeEach(async () => {
  // Jeder Test beginnt mit einer leeren Datenbank.
  await Promise.all(db.tables.map((table) => table.clear()));
});

afterEach(() => {
  cleanup();
});
