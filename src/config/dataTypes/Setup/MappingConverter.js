import React from "react";
import ConverterFilledIcon from "../../../icons/ConverterFilledIcon";
import StringCodeControl from "../../../components/StringCodeControl";

export default {
    title: 'Mapping Converter',
    icon: <ConverterFilledIcon/>,
    actions: {
        index: {
            fields: ['namespace', 'name', 'source_data_type', 'target_data_type', 'discard_events', 'updated_at']
        },
        new: {
            fields: ['namespace', 'name', 'source_data_type', 'target_data_type', 'discard_events', 'mapping'],
            seed: {
                mapping: {}
            }
        }
    }
};