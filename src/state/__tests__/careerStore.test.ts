/// <reference types="jest" />

import { useCareerStore } from '@/src/state/careerStore';

const initialState = useCareerStore.getState();

beforeEach(() => {
  useCareerStore.setState(initialState, true);
});

describe('useCareerStore', () => {
  it('starts blank so every student begins with their own applications, not sample data', () => {
    expect(useCareerStore.getState().applications).toEqual([]);
  });

  it('addApplication always starts a new application at "saved", regardless of input', () => {
    const created = useCareerStore.getState().addApplication({
      company: 'Acme Corp',
      role: 'Software Intern',
    });

    expect(created.status).toBe('saved');
    expect(created.id).toBeTruthy();
    expect(useCareerStore.getState().applications).toEqual([created]);
  });

  it('addApplication prepends so the most recent shows up first', () => {
    const first = useCareerStore.getState().addApplication({ company: 'First Co', role: 'Intern' });
    const second = useCareerStore.getState().addApplication({ company: 'Second Co', role: 'Intern' });

    expect(useCareerStore.getState().applications).toEqual([second, first]);
  });

  it('updateApplicationStatus updates only the targeted application', () => {
    const first = useCareerStore.getState().addApplication({ company: 'Acme Corp', role: 'Intern' });
    const second = useCareerStore.getState().addApplication({ company: 'Other Corp', role: 'Intern' });

    useCareerStore.getState().updateApplicationStatus(first.id, 'interviewing');

    const applications = useCareerStore.getState().applications;
    expect(applications.find((app) => app.id === first.id)?.status).toBe('interviewing');
    expect(applications.find((app) => app.id === second.id)?.status).toBe('saved');
  });

  it('removeApplication removes only the targeted application', () => {
    const first = useCareerStore.getState().addApplication({ company: 'Acme Corp', role: 'Intern' });
    const second = useCareerStore.getState().addApplication({ company: 'Other Corp', role: 'Intern' });

    useCareerStore.getState().removeApplication(first.id);

    expect(useCareerStore.getState().applications).toEqual([second]);
  });
});
