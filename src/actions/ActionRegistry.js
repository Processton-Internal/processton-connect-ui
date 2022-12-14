import Random from '../util/Random';

export const ActionKind = Object.freeze({
  root: 'root',
  collection: 'collection',
  member: 'member'
});

export const CRUD = Object.freeze({
  create: 'create',
  read: 'read',
  update: 'update',
  delete: 'delete'
});

class ActionRegistryClass {

  actions = {};

  byKey = key => this.actions[key];

  register = (action, props = {}) => {
    props.key = props.key || Random.string();
    if (!props.hasOwnProperty('arity')) {
      props.arity = 0;
    }
    Object.keys(props).forEach(key => action[key] = props[key]);
    this.actions[action.key] = action;
    return action;
  };

  findBy = (...criterion) => {
    return Object.values(this.actions).filter(
      action => criterion.find(
        criteria => !Object.keys(criteria).find(
          key => criteria[key] !== action[key]
        )
      )
    );
  };
}

const ActionRegistry = new ActionRegistryClass();

export default ActionRegistry;
