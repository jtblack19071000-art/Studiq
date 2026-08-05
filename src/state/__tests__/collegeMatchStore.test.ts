/// <reference types="jest" />

import { useCollegeMatchStore } from '@/src/state/collegeMatchStore';

const initialState = useCollegeMatchStore.getState();

beforeEach(() => {
  useCollegeMatchStore.setState(initialState, true);
});

describe('useCollegeMatchStore', () => {
  it('starts with empty preferences and no saved schools', () => {
    expect(useCollegeMatchStore.getState().preferences).toEqual({});
    expect(useCollegeMatchStore.getState().schools).toEqual([]);
  });

  it('setPreferences merges a partial patch without dropping existing fields', () => {
    useCollegeMatchStore.getState().setPreferences({ intendedMajor: 'Chemistry' });
    useCollegeMatchStore.getState().setPreferences({ locationPreference: 'Northeast US' });

    expect(useCollegeMatchStore.getState().preferences).toEqual({
      intendedMajor: 'Chemistry',
      locationPreference: 'Northeast US',
    });
  });

  it('addSchool always starts a new school at "researching", regardless of input', () => {
    const created = useCollegeMatchStore.getState().addSchool({ name: 'Tech University', program: 'CS' });

    expect(created.status).toBe('researching');
    expect(created.id).toBeTruthy();
    expect(useCollegeMatchStore.getState().schools).toEqual([created]);
  });

  it('updateSchoolStatus updates only the targeted school', () => {
    const first = useCollegeMatchStore.getState().addSchool({ name: 'Tech University' });
    const second = useCollegeMatchStore.getState().addSchool({ name: 'State University' });

    useCollegeMatchStore.getState().updateSchoolStatus(first.id, 'applied');

    const schools = useCollegeMatchStore.getState().schools;
    expect(schools.find((school) => school.id === first.id)?.status).toBe('applied');
    expect(schools.find((school) => school.id === second.id)?.status).toBe('researching');
  });

  it('removeSchool removes only the targeted school', () => {
    const first = useCollegeMatchStore.getState().addSchool({ name: 'Tech University' });
    const second = useCollegeMatchStore.getState().addSchool({ name: 'State University' });

    useCollegeMatchStore.getState().removeSchool(first.id);

    expect(useCollegeMatchStore.getState().schools).toEqual([second]);
  });
});
