/**
 * Created by David on 23-Apr-18.
 */

import config, { setOptions } from './utils/config'
import VueScheduler from './components/VueScheduler';

import moment from 'moment-timezone';

export default {
  install: (Vue, options = {}) => {

    setOptions(Object.assign(config, options));
    moment.locale(config.locale);
    moment.tz.setDefault(config.timezone);

    Vue.component('vue-scheduler', VueScheduler);
  }
}
