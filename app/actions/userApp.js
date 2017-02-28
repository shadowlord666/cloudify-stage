/**
 * Created by kinneretzin on 21/02/2017.
 */

import * as types from './types';
import fetch from 'isomorphic-fetch';
import {createPageFromInitialTemplate} from './page';
import External from '../utils/External';

const  CURRENT_APP_DATA_VERSION = 1;

function setPages(pages) {
    return {
        type: types.SET_PAGES,
        pages,
        receivedAt: Date.now()
    }
}

export function saveUserAppData (ip,username,role,appData) {
    return function(dispatch) {
        var data = {appData , version: CURRENT_APP_DATA_VERSION};

        var external = new External();
        return external.doPost(`/ua/${ip}/${username}/${role}`,null,data);
    }
}

export function loadOrCreateUserAppData (manager,config,templates,widgetDefinitions) {
    return function(dispatch,getState) {

        var external = new External();
        return external.doGet(`/ua/${manager.ip}/${manager.username}/${manager.auth.role}`)
            .then(userApp=>{
                if (userApp &&
                    userApp.appDataVersion === CURRENT_APP_DATA_VERSION &&
                    userApp.appData.pages && userApp.appData.pages.length > 0) {
                    dispatch(setPages(userApp.appData.pages));
                } else {
                    // First clear the pages
                    dispatch(setPages([]));

                    // Need to create from initial template
                    var initialTemplateName = config.app['initialTemplate'][config.mode === 'customer' ? 'customer': manager.auth.role] || 'initial-template';
                    var initialTemplate = templates[initialTemplateName];
                    dispatch(createPageFromInitialTemplate(initialTemplate,templates,widgetDefinitions));

                    var data = { pages: getState().pages};
                    return dispatch(saveUserAppData(manager.ip,manager.username,manager.auth.role,data));
                }
            });
    }
}