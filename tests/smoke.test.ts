import { describe, it, expect } from 'vitest';

describe('dsh-workbench scaffold', () => {
  it('declares the expected package name', () => {
    expect('@local/dsh-workbench').toContain('workbench');
  });
});
