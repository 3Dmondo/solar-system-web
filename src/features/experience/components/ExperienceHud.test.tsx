import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperienceHud } from './ExperienceHud';

describe('ExperienceHud', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows overview state as informational HUD content', () => {
    render(
      <ExperienceHud
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="overview"
        focusedBodyDisplayName={null}
      />
    );

    expect(screen.getByText('Solar System')).toBeInTheDocument();
    expect(screen.getByText(/interactive solar system overview/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the focused body state without owning overview recovery', () => {
    render(
      <ExperienceHud
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="saturn"
        focusedBodyDisplayName="Saturn"
      />
    );

    expect(screen.getByText('Saturn')).toBeInTheDocument();
    expect(screen.getByText(/focused body view/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /overview/i })).not.toBeInTheDocument();
  });

  it('exposes a close action when the shell owns HUD visibility', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ExperienceHud
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="overview"
        focusedBodyDisplayName={null}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close information panel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a focused-body facts drawer when facts are available', () => {
    render(
      <ExperienceHud
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="ganymede"
        focusedBodyDisplayName="Ganymede"
        focusedBodyFacts={{
          summaryParagraphs: [
            'Ganymede is Jupiter\'s largest moon and the largest natural satellite in the solar system.',
            'Its surface mixes older dark terrain with younger grooved regions shaped by tectonic processes.'
          ],
          rows: [
            { label: 'Radius', value: '2,634 km' },
            { label: 'Gravity', value: '1.43 m/s^2' },
            { label: 'Density', value: '1,942 kg/m^3' },
            { label: 'Source', value: 'Wikipedia description; Generated physical metadata, NAIF 503' }
          ]
        }}
      />
    );

    expect(screen.getByRole('region', { name: /focused body facts/i })).toBeInTheDocument();
    expect(screen.getByText(/largest natural satellite/i)).toBeInTheDocument();
    expect(screen.getByText(/tectonic processes/i)).toBeInTheDocument();
    expect(screen.getByText('2,634 km')).toBeInTheDocument();
    expect(screen.queryByText('Parent')).not.toBeInTheDocument();
    expect(screen.queryByText('Role')).not.toBeInTheDocument();
    expect(screen.getByText('Wikipedia description; Generated physical metadata, NAIF 503'))
      .toBeInTheDocument();
  });

  it('shows an explicit error status message when real ephemeris loading fails', () => {
    render(
      <ExperienceHud
        catalogError={new Error('Network exploded')}
        catalogStatus="error"
        focusedBodyId="overview"
        focusedBodyDisplayName={null}
      />
    );

    expect(screen.getByText(/real ephemeris data is unavailable right now/i)).toBeInTheDocument();
    expect(screen.getByText(/network exploded/i)).toBeInTheDocument();
  });

  it('shows a range warning separately from catalog failures', () => {
    render(
      <ExperienceHud
        catalogError={new Error('Requested time 999999 is outside the supported ephemeris range')}
        catalogStatus="error"
        focusedBodyId="overview"
        focusedBodyDisplayName={null}
        rangeWarning={{
          title: 'Ephemeris range reached.',
          detail: 'Paused at 2100-01-02 23:58 UTC.',
          hint: 'Valid range: 1901-01-03 23:58 UTC to 2100-01-02 23:58 UTC. Switch direction to continue.'
        }}
      />
    );

    expect(screen.getByText('Ephemeris range reached.')).toBeInTheDocument();
    expect(screen.getByText('Paused at 2100-01-02 23:58 UTC.')).toBeInTheDocument();
    expect(screen.getByText(/valid range: 1901-01-03 23:58 UTC to 2100-01-02 23:58 UTC/i))
      .toBeInTheDocument();
    expect(screen.queryByText(/999999/)).not.toBeInTheDocument();
  });

  it('shows a loading message without claiming a fallback snapshot is active', () => {
    render(
      <ExperienceHud
        catalogError={null}
        catalogStatus="loading"
        focusedBodyId="overview"
        focusedBodyDisplayName={null}
      />
    );

    expect(screen.getByText(/loading real positions for the requested time/i)).toBeInTheDocument();
    expect(screen.queryByText(/showing the fallback snapshot/i)).not.toBeInTheDocument();
  });

  it('docks the narrow HUD below the top rail', () => {
    const css = readFileSync('src/features/experience/components/experience-hud.css', 'utf8');

    expect(css).toMatch(
      /@media \(max-width: 767px\)\s*{\s*\.experience-hud\s*{[^}]*inset: 4\.05rem 0\.75rem auto auto;/s
    );
    expect(css).not.toMatch(/bottom: (8\.75|4\.25)rem/);
  });

  it('keeps the HUD scrollable on short screens', () => {
    const css = readFileSync('src/features/experience/components/experience-hud.css', 'utf8');

    expect(css).toMatch(/\.experience-hud\s*{[^}]*overflow-y: auto;/s);
    expect(css).toMatch(/\.experience-hud\s*{[^}]*pointer-events: auto;/s);
    expect(css).toMatch(/\.experience-hud\s*{[^}]*touch-action: pan-y;/s);
    expect(css).not.toMatch(/\.experience-hud\s*{[^}]*pointer-events: none;/s);
  });
});
