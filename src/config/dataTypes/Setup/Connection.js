import React from 'react';
import ConnectorFilledIcon from "../../../icons/ConnectorFilledIcon";

export default {
    title: 'Connection',
    icon: <ConnectorFilledIcon/>,
    actions: {
        index: {
            fields: ['namespace', 'name', 'url', 'authorization', 'number', 'token', 'updated_at']
        }
    }
};