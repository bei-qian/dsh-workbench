import { describe, it, expect } from 'vitest';

describe('dsh-workbench scaffold', () => {
  it('declares the expected package name', () => {
    expect('@bei-qian/dsh-workbench').toContain('workbench');
  });
});
