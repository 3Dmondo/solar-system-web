import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExperienceHud } from './ExperienceHud';

describe('ExperienceHud', () => {
  it('shows the focused body name', () => {
    render(<ExperienceHud focusedBodyId="saturn" />);

    expect(screen.getByText('Saturn')).toBeInTheDocument();
    expect(screen.getByText('Tap or click a body to focus')).toBeInTheDocument();
  });
});
