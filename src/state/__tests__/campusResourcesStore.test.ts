/// <reference types="jest" />

import { useCampusResourcesStore } from '@/src/state/campusResourcesStore';

const initialState = useCampusResourcesStore.getState();

beforeEach(() => {
  useCampusResourcesStore.setState(initialState, true);
});

describe('useCampusResourcesStore', () => {
  it('seeds with starter resources', () => {
    expect(useCampusResourcesStore.getState().resources.length).toBeGreaterThan(0);
  });

  it('addResource assigns an id and appends to the list', () => {
    const before = useCampusResourcesStore.getState().resources.length;
    const created = useCampusResourcesStore.getState().addResource({
      name: 'Writing Center',
      category: 'tutoring',
      location: 'Library 2nd floor',
    });

    const resources = useCampusResourcesStore.getState().resources;
    expect(resources).toHaveLength(before + 1);
    expect(created.id).toBeTruthy();
    expect(resources[resources.length - 1]).toEqual(created);
  });

  it('removeResource removes only the targeted resource', () => {
    const created = useCampusResourcesStore.getState().addResource({
      name: 'Career Services',
      category: 'career_services',
    });
    const before = useCampusResourcesStore.getState().resources.length;

    useCampusResourcesStore.getState().removeResource(created.id);

    const resources = useCampusResourcesStore.getState().resources;
    expect(resources).toHaveLength(before - 1);
    expect(resources.find((resource) => resource.id === created.id)).toBeUndefined();
  });
});
