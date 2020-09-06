import React from 'react';
import SnippetFilledIcon from "../../../icons/SnippetFilledIcon";

export default {
    title: 'Snippet',
    icon: <SnippetFilledIcon/>,
    actions: {
        index: {
            fields: ['namespace', 'name', 'description', 'type', 'updated_at']
        }
    }
};