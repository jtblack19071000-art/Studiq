/// <reference types="jest" />

import { useCampusResourcesStore } from '@/src/state/campusResourcesStore';

const initialState = useCampusResourcesStore.getState();

beforeEach(() => {
  useCampusResourcesStore.setState(initialState, true);
});

describe('useCampusResourcesStore', () => {
  it('starts blank so every student fills in their own campus, not sample data', () => {
    expect(useCampusResourcesStore.getState().resources).toEqual([]);
  });

  it('addResource assigns an id and appends to the list', () => {
    const created = useCampusResourcesStore.getState().addResource({
      name: 'Writing Center',
      category: 'tutoring',
      location: 'Library 2nd floor',
    });

    expect(created.id).toBeTruthy();
    expect(useCampusResourcesStore.getState().resources).toEqual([created]);
  });

  it('removeResource removes only the targeted resource', () => {
    const first = useCampusResourcesStore.getState().addResource({
      name: 'Career Services',
      category: 'career_services',
    });
    const second = useCampusResourcesStore.getState().addResource({
      name: 'Writing Center',
      category: 'tutoring',
    });

    useCampusResourcesStore.getState().removeResource(first.id);

    expect(useCampusResourcesStore.getState().resources).toEqual([second]);
  });
});
