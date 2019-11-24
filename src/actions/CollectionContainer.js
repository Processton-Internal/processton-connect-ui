import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { useTheme } from "@material-ui/core";
import { appBarHeight } from "../layout/AppBar";
import ActionRegistry, { ActionKind } from "./ActionRegistry";
import { makeStyles } from '@material-ui/core/styles';

import Index from "./Index";
import New from './New';
import Show from "./Show";
import Edit from './Edit';
import ActionPicker from "./ActionPicker";
import zzip from "../util/zzip";
import CollectionActionsToolbar from "./CollectionActionsToolbar";
import MemberActionsToolbar from "./MemberActionsToolbar";


const actionContainerStyles = makeStyles(theme => ({
    actionContainer: {
        width: '100%',
        overflow: 'auto',
        position: 'relative',
        height: props => `calc(${props.height} - ${appBarHeight(theme)})`
    }
}));

function CollectionContainer({ docked, item, height, width, onItemPickup }) {
    const [baseSelector, setBaseSelector] = useState({});
    const [filterSelector, setFilterSelector] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [actionKey, setActionKey] = useState(Index.key);
    const [title, setTitle] = useState(null);
    const [dataType, setDataType] = useState(null);

    const theme = useTheme();
    const classes = actionContainerStyles();

    const itemKey = JSON.stringify(item);

    useEffect(() => {
        const subscription = zzip(
            item.getDataType(),
            item.getTitle()
        ).subscribe(([dataType, title]) => {
            setDataType(dataType);
            setTitle(title);
        });
        return () => subscription.unsubscribe();
    }, [item, itemKey]);

    if (!title) {
        return <Loading/>;
    }

    const handleSelect = selection => setSelectedItems(selection);

    const handleAction = actionKey => {
        const action = ActionRegistry.byKey(actionKey);
        if (action) {
            if (action.kind === ActionKind.collection) {
                setActionKey(actionKey);
            } else {
                onItemPickup({ dataTypeId: dataType.id, id: selectedItems[0].id });
            }
        }
    };

    const componentHeight = `${height} - ${appBarHeight(theme)}`;

    const ActionComponent = ActionRegistry.byKey(actionKey);

    const action = ActionComponent && <ActionComponent docked={docked}
                                                       dataType={dataType}
                                                       item={item}
                                                       selectedItems={selectedItems}
                                                       height={componentHeight}
                                                       width={width}
                                                       onSelect={handleSelect}
                                                       onItemPickup={onItemPickup}/>;

    return <React.Fragment>
        <CollectionActionsToolbar title={title}
                                  onAction={handleAction}
                                  arity={selectedItems.length}
                                  selectedKey={actionKey}/>
        <div className={classes.actionContainer}
             style={{ height: `calc(${componentHeight})` }}>
            {action}
        </div>
    </React.Fragment>;
}

export default CollectionContainer;
