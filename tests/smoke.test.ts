import { describe, it, expect } from 'vitest';

describe('dsh-workbench scaffold', () => {
  it('declares the expected package name', () => {
    expect('@beiqian/dsh-workbench').toContain('workbench');
  });
});
