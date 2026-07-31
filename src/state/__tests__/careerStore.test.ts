/// <reference types="jest" />

import { useCareerStore } from '@/src/state/careerStore';

const initialState = useCareerStore.getState();

beforeEach(() => {
  useCareerStore.setState(initialState, true);
});

describe('useCareerStore', () => {
  it('seeds with a starter application', () => {
    expect(useCareerStore.getState().applications.length).toBeGreaterThan(0);
  });

  it('addApplication always starts a new application at "saved", regardless of input', () => {
    const before = useCareerStore.getState().applications.length;
    const created = useCareerStore.getState().addApplication({
      company: 'Acme Corp',
      role: 'Software Intern',
    });

    expect(created.status).toBe('saved');
    expect(created.id).toBeTruthy();
    const applications = useCareerStore.getState().applications;
    expect(applications).toHaveLength(before + 1);
    // New applications are prepended so the most recent shows up first.
    expect(applications[0]).toEqual(created);
  });

  it('updateApplicationStatus updates only the targeted application', () => {
    const created = useCareerStore.getState().addApplication({ company: 'Acme Corp', role: 'Intern' });
    const otherId = useCareerStore.getState().applications[1].id;

    useCareerStore.getState().updateApplicationStatus(created.id, 'interviewing');

    const applications = useCareerStore.getState().applications;
    expect(applications.find((app) => app.id === created.id)?.status).toBe('interviewing');
    expect(applications.find((app) => app.id === otherId)?.status).not.toBe('interviewing');
  });

  it('removeApplication removes only the targeted application', () => {
    const created = useCareerStore.getState().addApplication({ company: 'Acme Corp', role: 'Intern' });
    const before = useCareerStore.getState().applications.length;

    useCareerStore.getState().removeApplication(created.id);

    const applications = useCareerStore.getState().applications;
    expect(applications).toHaveLength(before - 1);
    expect(applications.find((app) => app.id === created.id)).toBeUndefined();
  });
});
