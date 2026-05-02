import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BodyLabelText } from './BodyLabel';
import { BODY_LABEL_HTML_Z_INDEX_RANGE } from './bodyLabelLayering';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

describe('BodyLabel layering', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps label Html overlays below floating experience chrome', () => {
    const [maxLabelZIndex, minLabelZIndex] = BODY_LABEL_HTML_Z_INDEX_RANGE;

    expect(maxLabelZIndex).toBeLessThan(10);
    expect(minLabelZIndex).toBeGreaterThanOrEqual(0);
    expect(maxLabelZIndex).toBeGreaterThan(minLabelZIndex);
  });

  it('renders labels as passive text instead of clickable controls', () => {
    render(<BodyLabelText displayName="Earth" />);

    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Earth' })).not.toBeInTheDocument();
  });
});
