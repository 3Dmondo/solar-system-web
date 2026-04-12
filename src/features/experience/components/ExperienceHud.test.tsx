import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExperienceHud } from './ExperienceHud';

describe('ExperienceHud', () => {
  it('shows the focused body name', () => {
    render(<ExperienceHud focusedBodyId="saturn" />);

    expect(screen.getByText('Saturn')).toBeInTheDocument();
    expect(screen.getByText(/zoom out to reframe the wider system/i)).toBeInTheDocument();
  });

  it('toggles interaction instructions', async () => {
    const user = userEvent.setup();

    render(<ExperienceHud focusedBodyId="overview" />);

    const helpButton = screen.getAllByRole('button', { name: 'Show interaction help' })[0]!;

    await user.click(helpButton);

    expect(screen.getByText(/Desktop: drag to orbit/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile: drag to orbit/i)).toBeInTheDocument();
    expect(screen.getByText(/Zoom farther out/i)).toBeInTheDocument();
  });
});
