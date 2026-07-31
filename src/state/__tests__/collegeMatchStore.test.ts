/// <reference types="jest" />

import { useCollegeMatchStore } from '@/src/state/collegeMatchStore';

const initialState = useCollegeMatchStore.getState();

beforeEach(() => {
  useCollegeMatchStore.setState(initialState, true);
});

describe('useCollegeMatchStore', () => {
  it('starts with empty preferences and a seeded school', () => {
    expect(useCollegeMatchStore.getState().preferences).toEqual({});
    expect(useCollegeMatchStore.getState().schools.length).toBeGreaterThan(0);
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
    const before = useCollegeMatchStore.getState().schools.length;
    const created = useCollegeMatchStore.getState().addSchool({ name: 'Tech University', program: 'CS' });

    expect(created.status).toBe('researching');
    expect(created.id).toBeTruthy();
    expect(useCollegeMatchStore.getState().schools).toHaveLength(before + 1);
  });

  it('updateSchoolStatus updates only the targeted school', () => {
    const created = useCollegeMatchStore.getState().addSchool({ name: 'Tech University' });
    const seededId = useCollegeMatchStore.getState().schools[0].id;

    useCollegeMatchStore.getState().updateSchoolStatus(created.id, 'applied');

    const schools = useCollegeMatchStore.getState().schools;
    expect(schools.find((school) => school.id === created.id)?.status).toBe('applied');
    expect(schools.find((school) => school.id === seededId)?.status).not.toBe('applied');
  });

  it('removeSchool removes only the targeted school', () => {
    const created = useCollegeMatchStore.getState().addSchool({ name: 'Tech University' });
    const before = useCollegeMatchStore.getState().schools.length;

    useCollegeMatchStore.getState().removeSchool(created.id);

    const schools = useCollegeMatchStore.getState().schools;
    expect(schools).toHaveLength(before - 1);
    expect(schools.find((school) => school.id === created.id)).toBeUndefined();
  });
});
