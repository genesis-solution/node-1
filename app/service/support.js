const { default: axios } = require("axios")
const debug = require('debug')('app:service:support')
const verbose = require('debug')('verbose:app:service:support')

module.exports = {
    async notify(support) {

        const PROJECT_ID = process.env.PROJECT_ID;
        const TARGET = process.env.SUPPORT_SITE;
        const API_TOKEN = process.env.SUPPORT_SITE_API_TOKEN;

        const data = {
            title: support.title,
            description: support.description,
            project: PROJECT_ID,
            external: support._id,
            contact: support.contact,
            notify: false,
        };

        try {
            const res = await axios.post(
                TARGET + '/api/ticket/create-ticket',
                data,
                {
                    headers: {
                        'Authorization': 'Bearer ' + API_TOKEN,
                    }
                }
            );
            verbose.extend('notify')(res.data)
        } catch (error) {

            debug.extend('notify')(error);
            debug.extend('notify')(error.response?.data);

        }

    },

    async notifyPatch(support) {
        try {
            const PROJECT_ID = process.env.PROJECT_ID;
            const TARGET = process.env.SUPPORT_SITE;
            const API_TOKEN = process.env.SUPPORT_SITE_API_TOKEN;
            //['open', 'in_progress', 'resolved']
            //['Assigned', 'In-Progress', 'On-Hold','Completed','Resolved', 'Under Review']
            const statusMapper = {
                open: 'Under Review',
                in_progress: 'In-Progress',
                'resolved': 'Resolved',
            }
    
            const status = statusMapper[support.status]
            const priority = support.priority.charAt(0).toUpperCase() + support.priority.slice(1)
            const update = {
                // issueDescription: undefined,
                priority: priority,
                status: status,
                external: support._id,
                notify: false,
            }
    
            const res = await axios.patch(TARGET + '/api/ticket/update/', update, {
                headers: {
                    'Authorization': 'Bearer ' + API_TOKEN,
                }
            })
            verbose.extend('notifyPatch')(res.data)
        } catch (error) {
            debug.extend('notifyPatch')(error);
            debug.extend('notifyPatch')(error.response?.data);

        }
    }
}