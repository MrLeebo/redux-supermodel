import jsdom from 'jsdom/lib/old-api.js'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

/* eslint-disable no-undef */
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = window.navigator
/* eslint-enable no-undef */
