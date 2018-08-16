import * as loginActions from './login'
import * as homeActoins from './home'
import * as chatActions from './chat'
import * as wallActions from './wall'

export const ActionCreators = Object.assign({},
  loginActions,
  homeActoins,
  chatActions,
  wallActions
);